/** Pagination types shared across all API clients */

export interface PaginatedMeta {
  total: number
  page: number
  pageSize: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginatedMeta
}

export interface SingleResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; code: string; message: string }>
  }
}

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  [key: string]: string | number | undefined
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}
