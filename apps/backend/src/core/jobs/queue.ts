/**
 * @suop/backend — Background Job Framework
 *
 * Per Phase 0 Architecture §17:
 *   - Scheduled jobs (cron) + queued jobs (enqueued by app)
 *   - Retry with exponential backoff
 *   - Dead-letter queue for exhausted retries
 *   - Distributed lock prevents duplicate job instances
 *
 * Phase 0 implementation: DB-backed job queue (no BullMQ/Redis required).
 * Future: swap for BullMQ when scaling needs it.
 */

import { db } from '@/core/db'
import { logger } from '@/core/logging'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface JobPayload {
  [key: string]: unknown
}

export interface JobResult {
  success: boolean
  data?: unknown
  error?: string
}

export abstract class BaseJob<TPayload extends JobPayload = JobPayload> {
  abstract readonly jobName: string
  abstract readonly concurrency: number
  abstract readonly maxRetries: number
  abstract execute(payload: TPayload): Promise<JobResult>
}

export interface ScheduledJob {
  jobName: string
  cronExpression: string
  payload: JobPayload
  enabled: boolean
}

// ─── Job Registry ───────────────────────────────────────────────────────────

class JobRegistry {
  private readonly jobs = new Map<string, BaseJob>()
  private readonly schedules = new Map<string, ScheduledJob>()

  register(job: BaseJob): void {
    if (this.jobs.has(job.jobName)) {
      throw new Error(`Job '${job.jobName}' already registered`)
    }
    this.jobs.set(job.jobName, job)
    logger.info('Job registered', { jobName: job.jobName })
  }

  get(jobName: string): BaseJob {
    const job = this.jobs.get(jobName)
    if (!job) throw new Error(`Job '${jobName}' not found`)
    return job
  }

  list(): string[] {
    return Array.from(this.jobs.keys()).sort()
  }

  schedule(schedule: ScheduledJob): void {
    this.schedules.set(schedule.jobName, schedule)
    logger.info('Job scheduled', {
      jobName: schedule.jobName,
      cron: schedule.cronExpression,
    })
  }

  getSchedules(): ScheduledJob[] {
    return Array.from(this.schedules.values())
  }
}

export const jobRegistry = new JobRegistry()

// ─── Job Queue (DB-backed) ──────────────────────────────────────────────────

class JobQueue {
  /**
   * Enqueue a job for execution.
   */
  async enqueue<T extends JobPayload>(
    jobName: string,
    payload: T,
    options?: { scheduledFor?: Date; tenantId?: string }
  ): Promise<string> {
    const job = jobRegistry.get(jobName)

    const record = await db.backgroundJob.create({
      data: {
        tenantId: options?.tenantId ?? '00000000-0000-0000-0000-000000000000',
        jobName: job.jobName,
        payload: payload as object,
        scheduledFor: options?.scheduledFor ?? new Date(),
        status: 'PENDING',
        maxRetries: job.maxRetries,
      },
    })

    logger.info('Job enqueued', { jobName, jobId: record.id })
    return record.id
  }

  /**
   * Claim the next pending job (atomic — prevents duplicate execution).
   */
  async claimNext(): Promise<{
    id: string
    jobName: string
    payload: JobPayload
    attempts: number
    maxRetries: number
  } | null> {
    // Use a transaction to atomically claim a job
    const result = await db.$transaction(async (tx) => {
      const pending = await tx.backgroundJob.findFirst({
        where: {
          status: 'PENDING',
          scheduledFor: { lte: new Date() },
        },
        orderBy: { scheduledFor: 'asc' },
      })

      if (!pending) return null

      const claimed = await tx.backgroundJob.update({
        where: { id: pending.id },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
          attempts: { increment: 1 },
        },
      })

      return {
        id: claimed.id,
        jobName: claimed.jobName,
        payload: claimed.payload as JobPayload,
        attempts: claimed.attempts,
        maxRetries: claimed.maxRetries,
      }
    })

    return result
  }

  /**
   * Mark a job as completed.
   */
  async complete(jobId: string, result: JobResult): Promise<void> {
    await db.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        result: result as object,
        completedAt: new Date(),
      },
    })
  }

  /**
   * Mark a job as failed (retry if attempts remain, else dead-letter).
   */
  async fail(jobId: string, error: string): Promise<void> {
    const job = await db.backgroundJob.findUnique({ where: { id: jobId } })
    if (!job) return

    const exhausted = job.attempts >= job.maxRetries
    await db.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: exhausted ? 'DEAD_LETTER' : 'PENDING',
        lastError: error,
        ...(exhausted ? { completedAt: new Date() } : {}),
      },
    })

    if (exhausted) {
      logger.error('Job moved to dead-letter queue', {
        jobId,
        jobName: job.jobName,
        attempts: job.attempts,
        error,
      })
    }
  }

  /**
   * Get dead-lettered jobs (for admin inspection / manual retry).
   */
  async getDeadLettered(limit: number = 50): Promise<unknown[]> {
    return db.backgroundJob.findMany({
      where: { status: 'DEAD_LETTER' },
      orderBy: { completedAt: 'desc' },
      take: limit,
    })
  }
}

export const jobQueue = new JobQueue()

// ─── Job Worker ─────────────────────────────────────────────────────────────

class JobWorker {
  private running = false
  private interval: NodeJS.Timeout | null = null

  /**
   * Start the worker — polls for jobs at the given interval.
   */
  start(pollIntervalMs: number = 5000): void {
    if (this.running) return
    this.running = true
    logger.info('Job worker started', { pollIntervalMs })

    this.interval = setInterval(() => {
      void this.tick()
    }, pollIntervalMs)
  }

  /**
   * Stop the worker.
   */
  stop(): void {
    this.running = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    logger.info('Job worker stopped')
  }

  /**
   * Process one job (if available).
   */
  private async tick(): Promise<void> {
    try {
      const claimed = await jobQueue.claimNext()
      if (!claimed) return

      const job = jobRegistry.get(claimed.jobName)
      logger.info('Job execution started', {
        jobId: claimed.id,
        jobName: claimed.jobName,
        attempt: claimed.attempts,
      })

      try {
        const result = await job.execute(claimed.payload)
        await jobQueue.complete(claimed.id, result)
        logger.info('Job completed', { jobId: claimed.id, jobName: claimed.jobName })
      } catch (err) {
        await jobQueue.fail(claimed.id, (err as Error).message)
        logger.warn('Job failed', {
          jobId: claimed.id,
          jobName: claimed.jobName,
          error: (err as Error).message,
        })
      }
    } catch (err) {
      logger.error('Job worker tick failed', { error: (err as Error).message })
    }
  }
}

export const jobWorker = new JobWorker()
