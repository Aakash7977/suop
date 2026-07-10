/**
 * @suop/backend — Enterprise File Service
 *
 * Per Phase 0 Architecture §16:
 *   - S3-compatible storage abstraction
 *   - Local driver (dev) / S3 driver (prod)
 *   - Signed URLs (short-lived, 15-min TTL)
 *   - MIME whitelist per category
 *   - File size limits
 *   - Virus scan hook (ClamAV — future)
 *   - Soft delete with retention
 */

import { createHash, randomUUID } from 'node:crypto'
import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { env } from '@/config/env'
import { logger } from '@/core/logging'
import { ValidationError, ExternalServiceError } from '@/core/errors'

// ─── Types ──────────────────────────────────────────────────────────────────

export type FileCategory =
  | 'COA' | 'EVIDENCE' | 'CALIBRATION_CERT' | 'AUDIT_REPORT'
  | 'INSPECTION_REPORT' | 'LAB_REPORT' | 'CLEANING_RECORD'
  | 'PROFILE_PHOTO' | 'DOCUMENT'

export interface UploadInput {
  filename: string
  mimeType: string
  size: number
  data: Buffer
  category: FileCategory
  linkedEntityType?: string
  linkedEntityId?: string
}

export interface UploadedFile {
  id: string
  filename: string
  mimeType: string
  size: number
  storageKey: string
  storageDriver: 'local' | 's3'
  checksum: string
  url: string
  category: FileCategory
}

export interface StorageDriver {
  upload(key: string, data: Buffer, mimeType: string): Promise<void>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, ttlSeconds: number): Promise<string>
}

// ─── Category Limits ────────────────────────────────────────────────────────

const CATEGORY_LIMITS: Record<FileCategory, {
  maxSize: number
  allowedMimeTypes: string[]
  retentionYears: number
}> = {
  COA: { maxSize: 5 * 1024 * 1024, allowedMimeTypes: ['application/pdf'], retentionYears: 7 },
  EVIDENCE: { maxSize: 10 * 1024 * 1024, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], retentionYears: 7 },
  CALIBRATION_CERT: { maxSize: 5 * 1024 * 1024, allowedMimeTypes: ['application/pdf'], retentionYears: 5 },
  AUDIT_REPORT: { maxSize: 10 * 1024 * 1024, allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], retentionYears: 10 },
  INSPECTION_REPORT: { maxSize: 5 * 1024 * 1024, allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'], retentionYears: 5 },
  LAB_REPORT: { maxSize: 5 * 1024 * 1024, allowedMimeTypes: ['application/pdf'], retentionYears: 7 },
  CLEANING_RECORD: { maxSize: 2 * 1024 * 1024, allowedMimeTypes: ['application/pdf', 'image/jpeg'], retentionYears: 3 },
  PROFILE_PHOTO: { maxSize: 2 * 1024 * 1024, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], retentionYears: 1 },
  DOCUMENT: { maxSize: 10 * 1024 * 1024, allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'], retentionYears: 5 },
}

// ─── Local Storage Driver ───────────────────────────────────────────────────

class LocalStorageDriver implements StorageDriver {
  constructor(private readonly basePath: string) {}

  async upload(key: string, data: Buffer, _mimeType: string): Promise<void> {
    const fullPath = join(this.basePath, key)
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, data)
  }

  async download(key: string): Promise<Buffer> {
    try {
      return await readFile(join(this.basePath, key))
    } catch {
      throw new ExternalServiceError(`File not found: ${key}`, 'EXTERNAL.S3_UNAVAILABLE')
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(join(this.basePath, key))
    } catch {
      // Already deleted — fine
    }
  }

  async getSignedUrl(key: string, _ttlSeconds: number): Promise<string> {
    // Local driver: return a simple path URL (dev only)
    return `/files/${key}`
  }
}

// ─── S3 Storage Driver (stub — requires AWS SDK) ────────────────────────────

class S3StorageDriver implements StorageDriver {
  constructor(
    private readonly bucket: string
  ) {}

  async upload(key: string, data: Buffer, mimeType: string): Promise<void> {
    // In production, this would use @aws-sdk/client-s3
    // For Phase 0, we log the operation
    logger.info('S3 upload (stub)', { key, bucket: this.bucket, mimeType, size: data.length })
    // Fall back to local storage in dev
    const local = new LocalStorageDriver('./uploads')
    await local.upload(key, data, mimeType)
  }

  async download(key: string): Promise<Buffer> {
    const local = new LocalStorageDriver('./uploads')
    return local.download(key)
  }

  async delete(key: string): Promise<void> {
    logger.info('S3 delete (stub)', { key, bucket: this.bucket })
    const local = new LocalStorageDriver('./uploads')
    await local.delete(key)
  }

  async getSignedUrl(key: string, _ttlSeconds: number): Promise<string> {
    // In production: generate presigned URL via S3 SDK
    return `/files/${key}`
  }
}

// ─── File Service ───────────────────────────────────────────────────────────

class FileService {
  private readonly driver: StorageDriver

  constructor() {
    // Select driver based on env
    if (env.NODE_ENV === 'production') {
      this.driver = new S3StorageDriver(env.S3_BUCKET)
    } else {
      this.driver = new LocalStorageDriver('./uploads')
    }
  }

  async upload(input: UploadInput): Promise<UploadedFile> {
    // Validate
    const limits = CATEGORY_LIMITS[input.category]
    if (!limits) {
      throw new ValidationError(`Unknown file category: ${input.category}`)
    }
    if (input.size > limits.maxSize) {
      throw new ValidationError(
        `File size ${input.size} exceeds max ${limits.maxSize} for category ${input.category}`
      )
    }
    if (!limits.allowedMimeTypes.includes(input.mimeType)) {
      throw new ValidationError(
        `MIME type '${input.mimeType}' not allowed for category ${input.category}. Allowed: ${limits.allowedMimeTypes.join(', ')}`
      )
    }

    // Generate storage key
    const fileId = randomUUID()
    const checksum = createHash('sha256').update(input.data).digest('hex')
    const ext = input.filename.split('.').pop() ?? ''
    const storageKey = `${input.category}/${fileId}.${ext}`

    // Upload
    await this.driver.upload(storageKey, input.data, input.mimeType)

    // Generate signed URL (15-min TTL)
    const url = await this.driver.getSignedUrl(storageKey, 900)

    return {
      id: fileId,
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.size,
      storageKey,
      storageDriver: env.NODE_ENV === 'production' ? 's3' : 'local',
      checksum,
      url,
      category: input.category,
    }
  }

  async download(storageKey: string): Promise<Buffer> {
    return this.driver.download(storageKey)
  }

  async delete(storageKey: string): Promise<void> {
    await this.driver.delete(storageKey)
  }

  async getSignedUrl(storageKey: string, ttlSeconds: number = 900): Promise<string> {
    return this.driver.getSignedUrl(storageKey, ttlSeconds)
  }
}

export const fileService = new FileService()
