/** File upload helpers for multipart/form-data */

import { getAuthToken } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

export async function uploadFile(path: string, file: File, fieldName: string = 'file'): Promise<unknown> {
  const formData = new FormData()
  formData.append(fieldName, file)
  const token = getAuthToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json
}

export async function uploadFiles(path: string, files: File[], fieldName: string = 'files'): Promise<unknown> {
  const formData = new FormData()
  files.forEach(f => formData.append(fieldName, f))
  const token = getAuthToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json
}
