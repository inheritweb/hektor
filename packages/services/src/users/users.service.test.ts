import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SortDirection } from '@hektor/types/contracts';
import type { SupabaseClient, User } from '@supabase/supabase-js';

import type { Database } from '@hektor/types/database';

const { buildUserMembershipCountsQueryMock } = vi.hoisted(() => ({
  buildUserMembershipCountsQueryMock: vi.fn(),
}));

vi.mock('./users.queries', () => ({
  createUsersQueries: () => ({
    buildCurrentUserOrganisationsQuery: vi.fn(),
    buildUserMembershipCountsQuery: buildUserMembershipCountsQueryMock,
  }),
}));

import { createUsersService } from './users.service';

const authUser = {
  id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
  email: 'alex@example.com',
  created_at: '2026-08-15T10:00:00.000Z',
  updated_at: '2026-08-15T11:00:00.000Z',
  last_sign_in_at: '2026-08-15T11:00:00.000Z',
  user_metadata: { full_name: 'Alex Morgan' },
  app_metadata: {},
  aud: 'authenticated',
  identities: [
    {
      id: 'google-subject',
      provider: 'google',
      identity_data: { email: 'alex@example.com' },
    },
  ],
} as unknown as User;

describe('admin user services', () => {
  beforeEach(() => {
    buildUserMembershipCountsQueryMock.mockReset();
  });

  it('lists the authoritative Auth page enriched with membership counts', async () => {
    const listUsersMock = vi.fn().mockResolvedValue({
      data: { users: [authUser], total: 1 },
      error: null,
    });
    const client = {
      auth: { admin: { listUsers: listUsersMock } },
    } as unknown as SupabaseClient<Database>;
    buildUserMembershipCountsQueryMock.mockResolvedValue({
      data: [{ user_id: authUser.id }, { user_id: authUser.id }],
      error: null,
    });

    await expect(
      createUsersService(client).listUsers({
        page: 2,
        pageSize: 10,
        order: 'createdAt',
        dir: SortDirection.Descending,
      }),
    ).resolves.toEqual({
      context: {
        page: 2,
        pageSize: 10,
        totalRecords: 1,
        sort: { order: 'createdAt', dir: SortDirection.Descending },
      },
      data: [
        {
          id: authUser.id,
          displayName: 'Alex Morgan',
          email: 'alex@example.com',
          avatarUrl: undefined,
          platformRole: undefined,
          createdAt: '2026-08-15T10:00:00.000Z',
          identityProviders: ['google'],
          lastSignInAt: '2026-08-15T11:00:00.000Z',
          membershipCount: 2,
        },
      ],
    });
    expect(listUsersMock).toHaveBeenCalledWith({ page: 2, perPage: 10 });
  });
});
