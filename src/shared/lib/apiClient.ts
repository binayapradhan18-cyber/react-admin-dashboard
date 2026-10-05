export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  override readonly name = 'ApiError';

  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  params?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

interface ClientConfig {
  baseUrl: string;
  getToken: () => string | null;
  onUnauthorized: () => void;
}

let config: ClientConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  getToken: () => null,
  onUnauthorized: () => undefined,
};

export function configureApiClient(overrides: Partial<ClientConfig>): void {
  config = { ...config, ...overrides };
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const STATUS_MESSAGES: Partial<Record<number, string>> = {
  400: 'The request was invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'The request conflicts with the current state.',
  422: 'Some fields are invalid.',
  500: 'The server encountered an error. Please try again.',
};

export function toApiError(status: number, payload: unknown): ApiError {
  const body = isRecord(payload) ? payload : {};
  const message =
    typeof body.message === 'string'
      ? body.message
      : (STATUS_MESSAGES[status] ?? `Request failed with status ${status}`);
  const code = typeof body.code === 'string' ? body.code : `HTTP_${status}`;
  const fieldErrors = isRecord(body.fieldErrors) ? (body.fieldErrors as FieldErrors) : {};
  return new ApiError(status, code, message, fieldErrors);
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof TypeError) {
    return new ApiError(0, 'NETWORK_ERROR', 'Unable to reach the server. Check your connection.');
  }
  if (error instanceof Error) return new ApiError(0, 'UNKNOWN', error.message);
  return new ApiError(0, 'UNKNOWN', 'Something went wrong.');
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(`${config.baseUrl}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({ Accept: 'application/json', ...options.headers });
  const token = config.getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.params), {
      method,
      headers,
      signal: options.signal ?? null,
      body: options.body === undefined ? null : JSON.stringify(options.body),
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw normalizeError(error);
  }

  const payload = await parseBody(response);
  if (!response.ok) {
    if (response.status === 401) config.onUnauthorized();
    throw toApiError(response.status, payload);
  }
  return payload as T;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T = void>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};
