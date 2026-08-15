import { beforeEach, describe, it, vi } from 'vitest';

import { HektorErrorCode } from '@hektor/types/contracts';

import {
  callApiEndpoint,
  expectApiError,
  expectApiResponse,
} from '@/tests/api/api-test-client';

const { createUsersServiceMock, getCurrentUserMock, getUserMock } = vi.hoisted(
  () => ({
    createUsersServiceMock: vi.fn(),
    getCurrentUserMock: vi.fn(),
    getUserMock: vi.fn(),
  }),
);

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

vi.mock('@hektor/services/users', () => ({
  createUsersService: createUsersServiceMock,
}));

import { GET } from './route';

describe('GET /api/me', () => {
  beforeEach(() => {
    createUsersServiceMock.mockReturnValue({
      getCurrentUser: getCurrentUserMock,
    });
    getCurrentUserMock.mockReset();
    getUserMock.mockReset();
  });

  it('returns a standard unauthorized response without a session', async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error('No session'),
    });

    const response = await callApiEndpoint(GET, { path: '/api/me' });

    await expectApiError(response, {
      code: HektorErrorCode.Unauthorized,
      message: 'You must be signed in',
    });
  });

  it('returns the current user in the standard response envelope', async () => {
    const user = { id: 'ab720a62-06df-408d-9e8c-0201ac69269a' };
    const currentUser = {
      id: user.id,
      displayName: 'Alex Morgan',
      platformRole: 'admin',
      email: 'alex@example.com',
      identities: [
        {
          id: 'google-provider-subject',
          provider: 'google',
          email: 'alex@example.com',
          createdAt: '2026-08-15T10:00:00.000Z',
        },
      ],
      memberships: [],
      createdAt: '2026-08-15T10:00:00.000Z',
      updatedAt: '2026-08-15T10:00:00.000Z',
    };
    getUserMock.mockResolvedValue({ data: { user }, error: null });
    getCurrentUserMock.mockResolvedValue({ data: currentUser });

    const response = await callApiEndpoint(GET, { path: '/api/me' });

    await expectApiResponse(response, currentUser);
  });
});
