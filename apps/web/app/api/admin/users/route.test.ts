import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole, UserStatus } from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createAdminSupabaseClientMock,
  createUsersServiceMock,
  getUserMock,
  listUsersMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createUsersServiceMock: vi.fn(),
  getUserMock: vi.fn(),
  listUsersMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock('@hektor/services/users', () => ({
  createUsersService: createUsersServiceMock,
}));

import { GET } from './route';

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    createAdminSupabaseClientMock.mockReset();
    createUsersServiceMock.mockReturnValue({ listUsers: listUsersMock });
    getUserMock.mockReset();
    listUsersMock.mockReset();
  });

  it('lists users through the privileged service client', async () => {
    const adminClient = { auth: { admin: {} } };
    const responseData = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 1,
        sort: { order: 'createdAt', dir: SortDirection.Descending },
      },
      data: [
        {
          id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
          displayName: 'Alex Morgan',
          email: 'alex@example.com',
          platformRole: PlatformRole.Admin,
          createdAt: '2026-08-15T10:00:00.000Z',
          identityProviders: ['google'],
          lastSignInAt: '2026-08-15T11:00:00.000Z',
          membershipCount: 1,
          status: UserStatus.Active,
        },
      ],
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    createAdminSupabaseClientMock.mockReturnValue(adminClient);
    listUsersMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(GET, {
      path: '/api/admin/users',
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(responseData);
    expect(createUsersServiceMock).toHaveBeenCalledWith(adminClient);
    expect(listUsersMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      order: 'createdAt',
      dir: SortDirection.Descending,
    });
  });
});
