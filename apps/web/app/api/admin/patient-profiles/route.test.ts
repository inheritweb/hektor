import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { getUserMock, listProfilesMock, serviceMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  listProfilesMock: vi.fn(),
  serviceMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/patient-profiles', () => ({
  createPatientProfilesService: serviceMock,
}));

import { GET } from './route';

describe('GET /api/admin/patient-profiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({ listAdminPatientProfiles: listProfilesMock });
    listProfilesMock.mockResolvedValue([]);
  });

  it('returns profiles to a platform administrator', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });

    const response = await callApiEndpoint(GET);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: [] });
    expect(listProfilesMock).toHaveBeenCalledOnce();
  });

  it('rejects a non-platform administrator before using the admin client', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-id', app_metadata: {} } },
      error: null,
    });

    const response = await callApiEndpoint(GET);

    expect(response.status).toBe(403);
    expect(listProfilesMock).not.toHaveBeenCalled();
  });
});
