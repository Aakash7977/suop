/**
 * @suop/sdk — Enterprise API Client SDK
 * Sprint 2: Epic 8
 *
 * Type-safe API client with authentication, retry, pagination,
 * error handling, and offline queue support.
 */

// ─── Types ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    cursor?: string;
    correlationId?: string;
  };
  errors?: Array<{ code: string; field: string; message: string }>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    cursor?: string;
    correlationId?: string;
  };
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  retry?: boolean;
  retryAttempts?: number;
  timeout?: number;
}

// ─── API Client ─────────────────────────────────────────
export class SUOPApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number = 30000;
  private defaultRetryAttempts: number = 3;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      params,
      retry = true,
      retryAttempts = this.defaultRetryAttempts,
      timeout = this.defaultTimeout,
    } = options;

    const url = this.buildUrl(path, params);
    const requestHeaders = this.getHeaders(headers);

    let lastError: Error | null = null;
    let attempts = retry ? retryAttempts : 1;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          // If 401 and we have a refresh token, try to refresh
          if (response.status === 401 && this.refreshToken && retry) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              // Retry the original request with new token
              requestHeaders['Authorization'] = `Bearer ${this.accessToken}`;
              continue;
            }
          }
          return data as ApiResponse<T>;
        }

        return data as ApiResponse<T>;
      } catch (error) {
        lastError = error as Error;
        if (attempt < attempts - 1) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    return {
      success: false,
      message: lastError?.message || 'Request failed',
      data: null,
      errors: [{ code: 'NETWORK_ERROR', field: '', message: lastError?.message || 'Network error' }],
    };
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.accessToken) {
          this.accessToken = data.data.accessToken;
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  // ─── HTTP Methods ──────────────────────────────────
  async get<T>(path: string, params?: Record<string, unknown>, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET', params });
  }

  async post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body' | 'params'>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  async put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body' | 'params'>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  async patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body' | 'params'>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  async delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body' | 'params'>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  // ─── Upload ────────────────────────────────────────
  async upload(path: string, file: File | Blob, fieldName: string = 'file', additionalData?: Record<string, string>): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append(fieldName, file);
    if (additionalData) {
      for (const [key, value] of Object.entries(additionalData)) {
        formData.append(key, value);
      }
    }

    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return response.json();
  }

  // ─── Download ──────────────────────────────────────
  async download(path: string, params?: Record<string, unknown>): Promise<Blob | null> {
    const url = this.buildUrl(path, params);
    const headers = this.getHeaders();

    const response = await fetch(url, { headers });
    if (!response.ok) return null;

    return response.blob();
  }

  // ─── Health Check ──────────────────────────────────
  async checkHealth(): Promise<ApiResponse<{ status: string; database: string; redis: string; rabbitmq: string; storage: string; version: string }>> {
    return this.get('/api/health');
  }
}

// ─── Export Singleton ───────────────────────────────────
let apiClient: SUOPApiClient | null = null;

export function getApiClient(baseUrl?: string): SUOPApiClient {
  if (!apiClient) {
    apiClient = new SUOPApiClient(baseUrl);
  }
  return apiClient;
}

export default getApiClient;
