import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OrganisationProvisionImportAction,
  OrganisationRole,
  PlatformRole,
} from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createServiceMock, getUserMock, previewMock } = vi.hoisted(() => ({
  createServiceMock: vi.fn(),
  getUserMock: vi.fn(),
  previewMock: vi.fn(),
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

describe('POST organisation provision import preview', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      previewOrganisationProvisionImport: previewMock,
    });
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
  });

  it('validates the CSV rows through the platform-admin service', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const body = {
      rows: [
        {
          email: 'ada@example.com',
          firstName: 'Ada',
          lastName: 'Lovelace',
          role: OrganisationRole.Learner,
          rowNumber: 2,
        },
      ],
    };
    const responseData = {
      data: {
        rows: [
          {
            ...body.rows[0],
            action: OrganisationProvisionImportAction.CreateProvision,
          },
        ],
        summary: { errors: 0, ready: 1, unchanged: 0 },
      },
    };
    previewMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      params: { organisationId },
      path: `/api/admin/organisations/${organisationId}/user-provisions/import/preview`,
    });

    expect(response.status).toBe(200);
    expect(previewMock).toHaveBeenCalledWith({ organisationId }, body);
  });
});
