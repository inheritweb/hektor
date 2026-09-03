import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { getUserMock, listScenariosMock, serviceMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  listScenariosMock: vi.fn(),
  serviceMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/patient-scenarios', () => ({
  createPatientScenariosService: serviceMock,
}));

import { GET } from './route';

describe('GET /api/admin/patient-profiles/:profileId/scenarios', () => {
  const profileId = '37ea1fbc-d47c-4b75-b918-19af6184bb3b';
  const versionId = '016a3ade-5634-4773-9c08-5c7984af3cec';

  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      listAdminPatientScenarios: listScenariosMock,
    });
    listScenariosMock.mockResolvedValue([]);
  });

  it('returns version-scoped scenarios to a platform administrator', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });

    const response = await callApiEndpoint(GET, {
      params: { profileId },
      query: { versionId },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: [] });
    expect(listScenariosMock).toHaveBeenCalledWith(profileId, versionId);
  });

  it('rejects an ordinary user before loading scenarios', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-id', app_metadata: {} } },
      error: null,
    });

    const response = await callApiEndpoint(GET, {
      params: { profileId },
      query: { versionId },
    });

    expect(response.status).toBe(403);
    expect(listScenariosMock).not.toHaveBeenCalled();
  });
});
