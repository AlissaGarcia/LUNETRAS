import { API_URL } from '../config/env';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestBody = unknown | URLSearchParams;

interface RequestOptions {
  method?: HttpMethod;
  body?: RequestBody;
   headers?: Record<string, string>;
}

export interface ApiErrorPayload {
  message?: string;
  statusCode?: number;
}

export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
function resolveBody(body: RequestBody | undefined): BodyInit | undefined {
  if (!body) {
    return undefined;
  }

  if (body instanceof URLSearchParams) {
    return body;
  }

  return JSON.stringify(body);
}

function resolveHeaders(body: RequestBody | undefined, headers?: Record<string, string>) {
  if (body instanceof URLSearchParams) {
    return {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      ...(headers ?? {}),
    };
  }

  return {
    'Content-Type': 'application/json',
    ...(headers ?? {}),
  };
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
const { method = 'GET', body, headers } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    credentials: 'include',
       headers: resolveHeaders(body, headers),
       body: resolveBody(body),
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;

    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = null;
    }

    throw new ApiError(payload?.message ?? 'Erro ao processar a requisição.', response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

 const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
