import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { getStatisticsMock, getUserMock, serviceMock } = vi.hoisted(() => ({
  getStatisticsMock: vi.fn(),
  getUserMock: vi.fn(),
  serviceMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/statistics', () => ({
  createStatisticsService: serviceMock,
}));

import { GET } from './route';

describe('GET /api/admin/statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({ getPlatformStatistics: getStatisticsMock });
    getStatisticsMock.mockResolvedValue({
      organisationCount: 4,
      userCount: 53,
    });
  });

  it('returns platform statistics to a platform administrator', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });

    const response = await callApiEndpoint(GET);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { organisationCount: 4, userCount: 53 },
    });
  });

  it('rejects a user without the platform administrator role', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-id', app_metadata: {} } },
      error: null,
    });

    const response = await callApiEndpoint(GET);

    expect(response.status).toBe(403);
    expect(getStatisticsMock).not.toHaveBeenCalled();
  });
});
