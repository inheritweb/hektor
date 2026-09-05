import { beforeEach, describe, expect, it, vi } from 'vitest';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { getUserMock, serviceMock, updateScenarioMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  serviceMock: vi.fn(),
  updateScenarioMock: vi.fn(),
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

import { PATCH } from './route';

describe('PATCH /api/admin/patient-scenarios/:scenarioIdentifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      updateAdminPatientScenarioDraft: updateScenarioMock,
    });
  });

  it('rejects an ordinary user before updating the scenario', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-id', app_metadata: {} } },
      error: null,
    });

    const response = await callApiEndpoint(PATCH, {
      method: 'PATCH',
      params: {
        scenarioIdentifier: 'e1cd82e8-745b-4f25-b828-a62d98a9fc2d',
      },
      body: {
        title: 'Updated scenario',
        slug: 'updated-scenario',
        description: 'Updated scenario metadata.',
        careSetting: 'acute_inpatient',
        intendedClinicalAudiences: ['nursing'],
        beginningStep: { title: 'Updated beginning' },
        expectedUpdatedAt: '2026-09-04T06:00:00.000Z',
      },
    });

    expect(response.status).toBe(403);
    expect(updateScenarioMock).not.toHaveBeenCalled();
  });
});
