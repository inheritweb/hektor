import { beforeEach, describe, expect, it, vi } from 'vitest';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createServiceMock, getAcceptanceMock, getUserMock } = vi.hoisted(
  () => ({
    createServiceMock: vi.fn(),
    getAcceptanceMock: vi.fn(),
    getUserMock: vi.fn(),
  }),
);

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ auth: { admin: {} } }),
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: createServiceMock,
}));

import { GET } from './route';

describe('GET provision acceptance', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      getProvisionAcceptance: getAcceptanceMock,
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
  });

  it('uses the authenticated verified identity', async () => {
    const provisionId = '03d946de-8938-46d8-93a4-e3917df0928e';
    getAcceptanceMock.mockResolvedValue({
      data: acceptanceDetail(provisionId),
    });
    const response = await callApiEndpoint(GET, {
      path: `/api/provisioning/${provisionId}`,
      params: { provisionId },
    });

    expect(response.status).toBe(200);
    expect(getAcceptanceMock).toHaveBeenCalledWith({
      provisionId,
      userId: 'user-id',
      email: 'learner@example.com',
      emailVerified: true,
    });
  });
});

function acceptanceDetail(provisionId: string) {
  return {
    id: provisionId,
    organisation: {
      id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      name: 'Northbridge University',
      slug: 'northbridge-university',
      status: 'active',
    },
    groups: [],
    invitationSendCount: 0,
    provisioningMethod: 'scim',
    provisionedUserName: 'learner@example.com',
    provisionedRole: 'learner',
    status: 'pending',
    createdAt: '2026-08-22T10:00:00.000Z',
    updatedAt: '2026-08-22T10:00:00.000Z',
  };
}
