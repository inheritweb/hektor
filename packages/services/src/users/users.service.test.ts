import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SortDirection } from '@hektor/types/contracts';
import { PlatformRole, UserStatus } from '@hektor/types';
import type { SupabaseClient, User } from '@supabase/supabase-js';

import type { Database } from '@hektor/types/database';

const {
  buildCurrentUserOrganisationsQueryMock,
  buildUserMembershipCountsQueryMock,
} = vi.hoisted(() => ({
  buildCurrentUserOrganisationsQueryMock: vi.fn(),
  buildUserMembershipCountsQueryMock: vi.fn(),
}));

vi.mock('./users.queries', () => ({
  createUsersQueries: () => ({
    buildCurrentUserOrganisationsQuery: buildCurrentUserOrganisationsQueryMock,
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
    buildCurrentUserOrganisationsQueryMock.mockReset();
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
        page: 1,
        pageSize: 10,
        order: 'createdAt',
        dir: SortDirection.Descending,
      }),
    ).resolves.toEqual({
      context: {
        page: 1,
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
          status: UserStatus.Active,
        },
      ],
    });
    expect(listUsersMock).toHaveBeenCalledWith({ page: 1, perPage: 1000 });
  });

  it('prevents an administrator from suspending their own account', async () => {
    const administrator = {
      ...authUser,
      app_metadata: { role: PlatformRole.Admin },
    } as User;
    const updateUserById = vi.fn();
    const client = {
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({
            data: { user: administrator },
            error: null,
          }),
          updateUserById,
        },
      },
    } as unknown as SupabaseClient<Database>;

    await expect(
      createUsersService(client).updateUser(
        { userId: administrator.id },
        {
          expectedUpdatedAt: administrator.updated_at!,
          firstName: 'Alex',
          lastName: 'Morgan',
          platformRole: PlatformRole.Admin,
          status: UserStatus.Suspended,
        },
        administrator.id,
      ),
    ).rejects.toMatchObject({
      message:
        'You cannot suspend yourself or remove your own platform admin access.',
    });
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it('updates account metadata and suspension without touching memberships', async () => {
    const revokeUserSessions = vi.fn().mockResolvedValue({ error: null });
    const updateUserById = vi.fn().mockResolvedValue({
      data: {
        user: {
          ...authUser,
          banned_until: '2126-08-15T11:00:00.000Z',
          user_metadata: {
            first_name: 'Alexandra',
            last_name: 'Morgan',
          },
        },
      },
      error: null,
    });
    const client = {
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({
            data: { user: authUser },
            error: null,
          }),
          updateUserById,
        },
      },
      rpc: revokeUserSessions,
    } as unknown as SupabaseClient<Database>;
    buildCurrentUserOrganisationsQueryMock.mockResolvedValue({
      data: [],
      error: null,
    });

    await expect(
      createUsersService(client).updateUser(
        { userId: authUser.id },
        {
          expectedUpdatedAt: authUser.updated_at!,
          firstName: 'Alexandra',
          lastName: 'Morgan',
          status: UserStatus.Suspended,
        },
        'another-administrator',
      ),
    ).resolves.toMatchObject({
      data: { displayName: 'Alexandra Morgan', status: UserStatus.Suspended },
    });
    expect(updateUserById).toHaveBeenCalledWith(
      authUser.id,
      expect.objectContaining({ ban_duration: '876000h' }),
    );
    expect(revokeUserSessions).toHaveBeenCalledWith('revoke_user_sessions', {
      target_user_id: authUser.id,
    });
    expect(buildCurrentUserOrganisationsQueryMock).toHaveBeenCalledWith(
      authUser.id,
    );
  });
});
