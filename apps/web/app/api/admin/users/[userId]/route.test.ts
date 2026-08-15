import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import {
  callApiEndpoint,
  expectApiResponse,
} from '@/tests/api/api-test-client';

const {
  createAdminSupabaseClientMock,
  createUsersServiceMock,
  getAuthenticatedUserMock,
  getUserMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createUsersServiceMock: vi.fn(),
  getAuthenticatedUserMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: getAuthenticatedUserMock },
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock('@hektor/services/users', () => ({
  createUsersService: createUsersServiceMock,
}));

import { GET } from './route';

describe('GET /api/admin/users/:userId', () => {
  beforeEach(() => {
    createAdminSupabaseClientMock.mockReset();
    createUsersServiceMock.mockReturnValue({ getUser: getUserMock });
    getAuthenticatedUserMock.mockReset();
    getUserMock.mockReset();
  });

  it('gets a user through the privileged service client', async () => {
    const userId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const adminClient = { auth: { admin: {} } };
    const responseData = {
      id: userId,
      displayName: 'Alex Morgan',
      email: 'alex@example.com',
      identities: [
        {
          id: 'google-subject',
          provider: 'google',
          email: 'alex@example.com',
        },
      ],
      memberships: [],
      createdAt: '2026-08-15T10:00:00.000Z',
      updatedAt: '2026-08-15T11:00:00.000Z',
    };
    getAuthenticatedUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    createAdminSupabaseClientMock.mockReturnValue(adminClient);
    getUserMock.mockResolvedValue({ data: responseData });

    const response = await callApiEndpoint(GET, {
      path: `/api/admin/users/${userId}`,
      params: { userId },
    });

    await expectApiResponse(response, responseData);
    expect(createUsersServiceMock).toHaveBeenCalledWith(adminClient);
    expect(getUserMock).toHaveBeenCalledWith({ userId });
  });
});
