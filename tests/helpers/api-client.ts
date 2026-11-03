import { APIRequestContext } from '@playwright/test';

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://backend-decofleursplus-staging.up.railway.app/api/v1';

export interface ApiResponse<T = any> {
  status: number;
  durationMs: number;
  body: {
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
      details?: any;
    };
  };
}

export class QAApiClient {
  private request: APIRequestContext;
  private token?: string;

  constructor(request: APIRequestContext, token?: string) {
    this.request = request;
    this.token = token;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(`${BACKEND_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
    }
    const start = Date.now();
    const res = await this.request.get(url.toString(), {
      headers: this.getHeaders(),
    });
    const durationMs = Date.now() - start;
    let body: any;
    try {
      body = await res.json();
    } catch {
      body = { success: false, raw: await res.text() };
    }
    return { status: res.status(), durationMs, body };
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const start = Date.now();
    const res = await this.request.post(`${BACKEND_URL}${endpoint}`, {
      headers: this.getHeaders(),
      data: data ? JSON.stringify(data) : undefined,
    });
    const durationMs = Date.now() - start;
    let body: any;
    try {
      body = await res.json();
    } catch {
      body = { success: false, raw: await res.text() };
    }
    return { status: res.status(), durationMs, body };
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const start = Date.now();
    const res = await this.request.patch(`${BACKEND_URL}${endpoint}`, {
      headers: this.getHeaders(),
      data: data ? JSON.stringify(data) : undefined,
    });
    const durationMs = Date.now() - start;
    let body: any;
    try {
      body = await res.json();
    } catch {
      body = { success: false, raw: await res.text() };
    }
    return { status: res.status(), durationMs, body };
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const start = Date.now();
    const res = await this.request.put(`${BACKEND_URL}${endpoint}`, {
      headers: this.getHeaders(),
      data: data ? JSON.stringify(data) : undefined,
    });
    const durationMs = Date.now() - start;
    let body: any;
    try {
      body = await res.json();
    } catch {
      body = { success: false, raw: await res.text() };
    }
    return { status: res.status(), durationMs, body };
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const start = Date.now();
    const res = await this.request.delete(`${BACKEND_URL}${endpoint}`, {
      headers: this.getHeaders(),
    });
    const durationMs = Date.now() - start;
    let body: any;
    try {
      body = await res.json();
    } catch {
      body = { success: false, raw: await res.text() };
    }
    return { status: res.status(), durationMs, body };
  }
}

