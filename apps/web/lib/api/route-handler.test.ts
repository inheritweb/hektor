import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { OrganisationRole, PlatformRole } from '@hektor/types';
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

const { createClientMock, getUserMock, rpcMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getUserMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock('../supabase/server', () => ({ createClient: createClientMock }));

import { registerEndpoint } from './route-handler';

const exampleContract = defineContract({
  method: 'POST',
  path: '/examples/:exampleId',
  access: { type: 'public' },
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
  beforeEach(() => {
    createClientMock.mockReset();
    getUserMock.mockReset();
    rpcMock.mockReset();
    createClientMock.mockResolvedValue({
      auth: { getUser: getUserMock },
      rpc: rpcMock,
    });
  });

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
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('returns unauthorized before calling an authenticated handler', async () => {
    const handler = vi.fn(() => ({ data: 'unused' }));
    const endpoint = registerEndpoint(
      defineContract({
        method: 'GET',
        path: '/authenticated',
        access: { type: 'authenticated' },
        output: hektorResponseSchema(z.string()),
      }),
      handler,
    );
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error('No session'),
    });

    const response = await callApiEndpoint(endpoint);

    await expectApiError(response, {
      code: HektorErrorCode.Unauthorized,
      message: 'You must be signed in',
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('supplies the verified user to an authenticated handler', async () => {
    const user = { id: 'user-id', app_metadata: {} };
    const endpoint = registerEndpoint(
      defineContract({
        method: 'GET',
        path: '/authenticated',
        access: { type: 'authenticated' },
        output: hektorResponseSchema(z.string()),
      }),
      (_, context) => ({ data: context.user.id }),
    );
    getUserMock.mockResolvedValue({ data: { user }, error: null });

    const response = await callApiEndpoint(endpoint);

    await expectApiResponse(response, user.id);
  });

  it('requires a declared platform role', async () => {
    const contract = defineContract({
      method: 'GET',
      path: '/admin',
      access: { type: 'platform', roles: [PlatformRole.Admin] },
      output: hektorResponseSchema(z.string()),
    });
    const handler = vi.fn(() => ({ data: 'allowed' }));
    const endpoint = registerEndpoint(contract, handler);
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-id', app_metadata: {} } },
      error: null,
    });

    const forbiddenResponse = await callApiEndpoint(endpoint);

    await expectApiError(forbiddenResponse, {
      code: HektorErrorCode.Forbidden,
      message: 'You do not have permission to perform this action',
    });
    expect(handler).not.toHaveBeenCalled();

    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });

    await expectApiResponse(await callApiEndpoint(endpoint), 'allowed');
  });

  it('checks organisation roles through the database', async () => {
    const organisationId = '3492a499-a216-4a30-8e3c-2c021d99d04f';
    const handler = vi.fn(() => ({ data: 'allowed' }));
    const endpoint = registerEndpoint(
      defineContract({
        method: 'GET',
        path: '/organisations/:organisationId/users',
        access: {
          type: 'organisation',
          organisationIdParam: 'organisationId',
          roles: [OrganisationRole.OrganisationAdmin],
        },
        params: z.object({ organisationId: z.uuid() }),
        output: hektorResponseSchema(z.string()),
      }),
      handler,
    );
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-id', app_metadata: {} } },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: false, error: null });

    const forbiddenResponse = await callApiEndpoint(endpoint, {
      params: { organisationId },
    });

    await expectApiError(forbiddenResponse, {
      code: HektorErrorCode.Forbidden,
      message: 'You do not have permission to perform this action',
    });
    expect(rpcMock).toHaveBeenCalledWith('has_organisation_role', {
      target_organisation_id: organisationId,
      allowed_roles: [OrganisationRole.OrganisationAdmin],
    });
    expect(handler).not.toHaveBeenCalled();

    rpcMock.mockResolvedValue({ data: true, error: null });

    await expectApiResponse(
      await callApiEndpoint(endpoint, { params: { organisationId } }),
      'allowed',
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
