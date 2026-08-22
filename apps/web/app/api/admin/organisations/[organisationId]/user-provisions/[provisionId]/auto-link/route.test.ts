import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { autoLinkMock, createServiceMock, getUserMock } = vi.hoisted(() => ({
  autoLinkMock: vi.fn(),
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

describe('POST organisation provision auto-link', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      autoLinkOrganisationUserProvision: autoLinkMock,
    });
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    autoLinkMock.mockResolvedValue({
      data: { outcome: 'pending_identity_verification' },
    });
  });

  it('attempts account matching as a platform admin', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const provisionId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const response = await callApiEndpoint(POST, {
      path: `/api/admin/organisations/${organisationId}/user-provisions/${provisionId}/auto-link`,
      params: { organisationId, provisionId },
      method: 'POST',
      body: {},
    });

    expect(response.status).toBe(200);
    expect(autoLinkMock).toHaveBeenCalledWith({ organisationId, provisionId });
  });
});
