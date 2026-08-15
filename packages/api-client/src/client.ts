import {
  hektorErrorResponseSchema,
  HektorErrorCode,
} from '@hektor/types/contracts';

export interface RequestOptions {
  params?: Record<string, unknown>;
  query?: unknown;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ClientOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

export class HektorApiError extends Error {
  readonly code: HektorErrorCode;
  readonly data?: Record<string, string>;

  constructor(
    code: HektorErrorCode,
    message: string,
    data?: Record<string, string>,
  ) {
    super(message);
    this.name = 'HektorApiError';
    this.code = code;
    this.data = data;
  }
}

function buildPath(path: string, params?: Record<string, unknown>) {
  return path.replace(/:([^/]+)/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined) throw new Error(`Missing path parameter: ${name}`);
    return encodeURIComponent(String(value));
  });
}

function encodeQuery(query: unknown) {
  if (!query || typeof query !== 'object') return '';
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) search.append(name, String(item));
  }
  const queryString = search.toString();
  return queryString ? `?${queryString}` : '';
}

export class Client {
  private readonly baseUrl: string;
  private readonly fetcher?: typeof globalThis.fetch;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? '').replace(/\/$/, '');
    this.fetcher = options.fetch;
  }

  async request(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<unknown> {
    const fetcher = this.fetcher ?? globalThis.fetch;
    const body = options.body;
    const response = await fetcher(
      `${this.baseUrl}${buildPath(path, options.params)}${encodeQuery(options.query)}`,
      {
        method,
        credentials: 'include',
        headers: {
          accept: 'application/json',
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
          ...options.headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
    const payload: unknown = await response.json();
    if (response.ok) return payload;

    const error = hektorErrorResponseSchema.safeParse(payload);
    if (error.success) {
      throw new HektorApiError(
        error.data.error.code,
        error.data.error.message,
        error.data.error.data,
      );
    }
    throw new HektorApiError(
      HektorErrorCode.InternalServerError,
      'The API returned an invalid error response',
    );
  }
}
