import { describe, it } from 'vitest';
import { z } from 'zod';

import {
  defineContract,
  HektorErrorCode,
  hektorResponseSchema,
} from '@hektor/types/contracts';
import { createServiceError } from '@hektor/services';

import {
  callApiEndpoint,
  expectApiError,
  expectApiResponse,
} from '../../tests/api/api-test-client';
import { registerEndpoint } from './route-handler';

const exampleContract = defineContract({
  method: 'POST',
  path: '/examples/:exampleId',
  params: z.object({ exampleId: z.uuid() }),
  query: z.object({ page: z.coerce.number().int().positive() }),
  body: z.object({ name: z.string().min(1) }),
  output: hektorResponseSchema(z.string()),
});

const validRequest = {
  method: 'POST',
  params: { exampleId: '3492a499-a216-4a30-8e3c-2c021d99d04f' },
  query: { page: 1 },
  body: { name: 'Clinical assessment' },
};

describe('registerEndpoint', () => {
  it('parses a valid request and validates its response', async () => {
    const endpoint = registerEndpoint(
      exampleContract,
      ({ params, query, body }) => ({
        data: `${params.exampleId}:${query.page}:${body.name}`,
      }),
    );
    const response = await callApiEndpoint(endpoint, {
      ...validRequest,
      path: '/examples/ignored-by-next-context',
      query: { page: 2 },
    });

    await expectApiResponse(
      response,
      '3492a499-a216-4a30-8e3c-2c021d99d04f:2:Clinical assessment',
    );
  });

  it('returns a standard validation error', async () => {
    const endpoint = registerEndpoint(exampleContract, () => ({
      data: 'unused',
    }));
    const response = await callApiEndpoint(endpoint, {
      ...validRequest,
      params: { exampleId: 'not-a-uuid' },
    });

    await expectApiError(response, {
      code: HektorErrorCode.UnprocessableEntity,
      message: 'Request validation failed',
      data: { exampleId: 'Invalid UUID' },
    });
  });

  it('returns a standard bad request for malformed JSON', async () => {
    const endpoint = registerEndpoint(exampleContract, () => ({
      data: 'unused',
    }));
    const response = await callApiEndpoint(endpoint, {
      ...validRequest,
      body: undefined,
      rawBody: '{',
    });

    await expectApiError(response, {
      code: HektorErrorCode.BadRequest,
      message: 'Request body must be valid JSON',
    });
  });

  it('preserves declared service errors', async () => {
    const endpoint = registerEndpoint(exampleContract, () => {
      throw createServiceError(HektorErrorCode.Conflict, {
        message: 'The example already exists',
        data: { name: 'Already in use' },
      });
    });
    const response = await callApiEndpoint(endpoint, validRequest);

    await expectApiError(response, {
      code: HektorErrorCode.Conflict,
      message: 'The example already exists',
      data: { name: 'Already in use' },
    });
  });

  it('sanitizes unexpected errors', async () => {
    const endpoint = registerEndpoint(exampleContract, () => {
      throw new Error('Database credentials were rejected');
    });
    const response = await callApiEndpoint(endpoint, validRequest);

    await expectApiError(response, {
      code: HektorErrorCode.InternalServerError,
      message: 'An unexpected error occurred',
    });
  });

  it('sanitizes output contract violations', async () => {
    const endpoint = registerEndpoint(exampleContract, () => {
      return { data: 42 } as never;
    });
    const response = await callApiEndpoint(endpoint, validRequest);

    await expectApiError(response, {
      code: HektorErrorCode.InternalServerError,
      message: 'An unexpected error occurred',
    });
  });
});
