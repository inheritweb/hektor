import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PlatformRole,
  ProvisioningLifecycleAction,
  ProvisioningStatus,
} from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createServiceMock, getUserMock, transitionMock } = vi.hoisted(() => ({
  createServiceMock: vi.fn(),
  getUserMock: vi.fn(),
  transitionMock: vi.fn(),
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

import { PATCH } from './route';

describe('PATCH organisation provision lifecycle', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      transitionOrganisationUserProvision: transitionMock,
    });
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    transitionMock.mockResolvedValue({
      data: { id: '03d946de-8938-46d8-93a4-e3917df0928e', status: 'inactive' },
    });
  });

  it('passes a validated lifecycle action to the service', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const provisionId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const body = {
      action: ProvisioningLifecycleAction.Deactivate,
      expectedStatus: ProvisioningStatus.Linked,
    };
    const response = await callApiEndpoint(PATCH, {
      path: `/api/admin/organisations/${organisationId}/user-provisions/${provisionId}/lifecycle`,
      params: { organisationId, provisionId },
      body,
      method: 'PATCH',
    });

    expect(response.status).toBe(200);
    expect(transitionMock).toHaveBeenCalledWith({ provisionId, ...body });
  });
});
