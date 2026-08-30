import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SCIM_USER_SCHEMA } from '@hektor/types';
import { createServiceError } from '@hektor/services';
import { HektorErrorCode } from '@hektor/types/contracts';

const { authenticateMock, listUsersMock, serviceMock, synchronizeUserMock } =
  vi.hoisted(() => ({
    authenticateMock: vi.fn(),
    listUsersMock: vi.fn(),
    serviceMock: vi.fn(),
    synchronizeUserMock: vi.fn(),
  }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/scim', () => ({ createScimService: serviceMock }));

import { GET, POST } from './route';

describe('/api/scim/v2/Users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      authenticate: authenticateMock,
      listUsers: listUsersMock,
      synchronizeUser: synchronizeUserMock,
    });
    authenticateMock.mockResolvedValue({ organisationId: 'organisation-1' });
  });

  it('authenticates by bearer token and creates a SCIM user', async () => {
    synchronizeUserMock.mockResolvedValue({
      active: true,
      id: 'user-1',
      meta: {
        created: '2026-08-29T00:00:00.000Z',
        lastModified: '2026-08-29T00:00:00.000Z',
        location: 'http://localhost/api/scim/v2/Users/user-1',
        resourceType: 'User',
      },
      schemas: [SCIM_USER_SCHEMA],
      userName: 'learner@example.test',
    });

    const response = await POST(
      new Request('http://localhost/api/scim/v2/Users', {
        body: JSON.stringify({
          active: true,
          schemas: [SCIM_USER_SCHEMA],
          userName: 'learner@example.test',
        }),
        headers: {
          authorization: 'Bearer secret-token',
          'content-type': 'application/scim+json',
        },
        method: 'POST',
      }),
    );

    expect(response.status).toBe(201);
    expect(response.headers.get('content-type')).toContain(
      'application/scim+json',
    );
    expect(authenticateMock).toHaveBeenCalledWith('secret-token');
    expect(synchronizeUserMock).toHaveBeenCalledWith(
      { organisationId: 'organisation-1' },
      expect.objectContaining({ userName: 'learner@example.test' }),
      'http://localhost/api/scim/v2',
    );
  });

  it('returns a SCIM authentication error without exposing Hektor errors', async () => {
    authenticateMock.mockRejectedValue(
      createServiceError(HektorErrorCode.Unauthorized, {
        message: 'The SCIM bearer token is invalid or inactive',
      }),
    );

    const response = await GET(
      new Request('http://localhost/api/scim/v2/Users', {
        headers: { authorization: 'Bearer invalid' },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status: '401',
    });
  });
});
