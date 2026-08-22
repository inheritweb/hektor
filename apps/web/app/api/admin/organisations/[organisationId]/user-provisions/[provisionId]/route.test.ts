import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createServiceMock, getProvisionMock, getUserMock } = vi.hoisted(() => ({
  createServiceMock: vi.fn(),
  getProvisionMock: vi.fn(),
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

import { GET } from './route';

describe('GET organisation provision detail', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      getOrganisationUserProvision: getProvisionMock,
    });
    getProvisionMock.mockReset();
    getUserMock.mockReset();
  });

  it('loads a provision for a platform admin', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const provisionId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const responseData = {
      data: {
        id: provisionId,
        organisation: {
          id: organisationId,
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
        },
        groups: [],
        provisioningMethod: 'manual',
        provisionedUserName: 'pending@example.com',
        provisionedRole: 'learner',
        status: 'pending',
        createdAt: '2026-08-15T10:00:00.000Z',
        updatedAt: '2026-08-15T10:00:00.000Z',
      },
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    getProvisionMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(GET, {
      path: `/api/admin/organisations/${organisationId}/user-provisions/${provisionId}`,
      params: { organisationId, provisionId },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(responseData);
    expect(getProvisionMock).toHaveBeenCalledWith({
      organisationId,
      provisionId,
    });
  });
});
