/** Request/response interceptors for logging, caching, 401 refresh */

export type RequestInterceptor = (req: RequestInit) => RequestInit | Promise<RequestInit>
export type ResponseInterceptor = (res: Response, req: RequestInit) => Response | Promise<Response>

const requestInterceptors: RequestInterceptor[] = []
const responseInterceptors: ResponseInterceptor[] = []

export function registerRequestInterceptor(fn: RequestInterceptor): () => void {
  requestInterceptors.push(fn)
  return () => {
    const idx = requestInterceptors.indexOf(fn)
    if (idx >= 0) requestInterceptors.splice(idx, 1)
  }
}

export function registerResponseInterceptor(fn: ResponseInterceptor): () => void {
  responseInterceptors.push(fn)
  return () => {
    const idx = responseInterceptors.indexOf(fn)
    if (idx >= 0) responseInterceptors.splice(idx, 1)
  }
}

export async function applyRequestInterceptors(req: RequestInit): Promise<RequestInit> {
  let result = req
  for (const fn of requestInterceptors) {
    result = await fn(result)
  }
  return result
}

export async function applyResponseInterceptors(res: Response, req: RequestInit): Promise<Response> {
  let result = res
  for (const fn of responseInterceptors) {
    result = await fn(result, req)
  }
  return result
}
