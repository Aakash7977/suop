/**
 * @suop/backend — Soft Delete Extension
 *
 * Overrides delete → sets deletedAt on models that support it.
 * Filters out soft-deleted records in find* by default.
 * Pass { includeDeleted: true } in args to bypass.
 */

import { Prisma } from '@prisma/client'

const SOFT_DELETE_MODELS = new Set(['FileUpload'])

 
type AnyArgs = any

export const softDeleteExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async findUnique({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          if (model && SOFT_DELETE_MODELS.has(model) && !args?.includeDeleted) {
            args.where = { ...(args.where ?? {}), deletedAt: null }
          }
          return query(args)
        },
        async findFirst({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          if (model && SOFT_DELETE_MODELS.has(model) && !args?.includeDeleted) {
            args.where = { ...(args.where ?? {}), deletedAt: null }
          }
          return query(args)
        },
        async findMany({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          if (model && SOFT_DELETE_MODELS.has(model) && !args?.includeDeleted) {
            args.where = { ...(args.where ?? {}), deletedAt: null }
          }
          return query(args)
        },
        async count({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          if (model && SOFT_DELETE_MODELS.has(model) && !args?.includeDeleted) {
            args.where = { ...(args.where ?? {}), deletedAt: null }
          }
          return query(args)
        },
        async delete({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          // For soft-delete models, convert delete to update with deletedAt
          if (model && SOFT_DELETE_MODELS.has(model)) {
             
            const modelClient = (client as any)[model]
            if (modelClient && typeof modelClient.update === 'function') {
              return modelClient.update({ where: args.where, data: { deletedAt: new Date() } })
            }
          }
          return query(args)
        },
        async deleteMany({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          if (model && SOFT_DELETE_MODELS.has(model)) {
             
            const modelClient = (client as any)[model]
            if (modelClient && typeof modelClient.updateMany === 'function') {
              return modelClient.updateMany({ where: args.where, data: { deletedAt: new Date() } })
            }
          }
          return query(args)
        },
        async update({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          if (model && SOFT_DELETE_MODELS.has(model)) {
            args.where = { ...(args.where ?? {}), deletedAt: null }
          }
          return query(args)
        },
        async updateMany({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          if (model && SOFT_DELETE_MODELS.has(model)) {
            args.where = { ...(args.where ?? {}), deletedAt: null }
          }
          return query(args)
        },
      },
    },
  })
})
