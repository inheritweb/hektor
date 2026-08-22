import { beforeEach, describe, expect, it, vi } from 'vitest';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { acceptMock, createServiceMock, getUserMock } = vi.hoisted(() => ({
  acceptMock: vi.fn(),
  createServiceMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ auth: { admin: {} } }),
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: createServiceMock,
}));

import { POST } from './route';

describe('POST provision acceptance', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      acceptOrganisationUserProvision: acceptMock,
    });
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
          email: 'learner@example.com',
          email_confirmed_at: '2026-08-22T10:00:00.000Z',
        },
      },
      error: null,
    });
    acceptMock.mockResolvedValue({
      data: {
        id: '03d946de-8938-46d8-93a4-e3917df0928e',
        status: 'linked',
      },
    });
  });

  it('accepts through the authenticated verified identity', async () => {
    const provisionId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const response = await callApiEndpoint(POST, {
      method: 'POST',
      path: `/api/provisioning/${provisionId}/accept`,
      params: { provisionId },
      body: {},
    });

    expect(response.status).toBe(200);
    expect(acceptMock).toHaveBeenCalledWith({
      provisionId,
      userId: 'user-id',
      email: 'learner@example.com',
      emailVerified: true,
    });
  });
});
