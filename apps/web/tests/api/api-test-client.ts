import { expect } from 'vitest';

import {
  hektorErrorResponseSchema,
  type HektorErrorCode,
} from '@hektor/types/contracts';

import type { RegisteredEndpoint } from '@/lib/api/route-handler';

interface ApiTestRequest {
  method?: string;
  path?: string;
  params?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  rawBody?: string;
  headers?: HeadersInit;
}

interface ExpectedApiError {
  code: HektorErrorCode;
  message: string;
  data?: Record<string, string>;
}

function requestUrl(path: string, query?: ApiTestRequest['query']) {
  const url = new URL(path, 'http://localhost');

  for (const [name, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(name, String(value));
  }

  return url;
}

export async function callApiEndpoint(
  endpoint: RegisteredEndpoint,
  options: ApiTestRequest = {},
) {
  const hasBody = options.body !== undefined || options.rawBody !== undefined;
  const body =
    options.rawBody ??
    (options.body === undefined ? undefined : JSON.stringify(options.body));
  const headers = new Headers(options.headers);

  if (hasBody && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return endpoint(
    new Request(requestUrl(options.path ?? '/', options.query), {
      method: options.method ?? 'GET',
      headers,
      body,
    }),
    { params: Promise.resolve(options.params ?? {}) },
  );
}

export async function expectApiResponse<T>(
  response: Response,
  expectedData: T,
  status = 200,
) {
  expect(response.status).toBe(status);
  await expect(response.json()).resolves.toEqual({ data: expectedData });
}

export async function expectApiError(
  response: Response,
  expected: ExpectedApiError,
) {
  expect(response.status).toBe(expected.code);

  const body: unknown = await response.json();
  const parsed = hektorErrorResponseSchema.parse(body);

  expect(parsed).toEqual({ error: expected });
}
