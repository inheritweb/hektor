import { beforeEach, describe, expect, it, vi } from 'vitest';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { getUserMock, resolvedRecordMock, serviceMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  resolvedRecordMock: vi.fn(),
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

describe('GET /api/admin/patient-scenarios/:scenarioIdentifier/resolved-record', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      getAdminPatientScenarioResolvedRecord: resolvedRecordMock,
    });
  });

  it('rejects an ordinary user before resolving the scenario', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-id', app_metadata: {} } },
      error: null,
    });

    const response = await callApiEndpoint(GET, {
      params: { scenarioIdentifier: 'esther-acute-ischaemic-stroke' },
    });

    expect(response.status).toBe(403);
    expect(resolvedRecordMock).not.toHaveBeenCalled();
  });
});
