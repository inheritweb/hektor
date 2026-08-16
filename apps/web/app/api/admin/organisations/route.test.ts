import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganisationStatus, PlatformRole } from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createAdminSupabaseClientMock,
  createOrganisationsServiceMock,
  getUserMock,
  listOrganisationsMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createOrganisationsServiceMock: vi.fn(),
  getUserMock: vi.fn(),
  listOrganisationsMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: createOrganisationsServiceMock,
}));

import { GET } from './route';

describe('GET /api/admin/organisations', () => {
  beforeEach(() => {
    createAdminSupabaseClientMock.mockReset();
    createOrganisationsServiceMock.mockReturnValue({
      listOrganisations: listOrganisationsMock,
    });
    getUserMock.mockReset();
    listOrganisationsMock.mockReset();
  });

  it('lists organisations through the privileged service client', async () => {
    const adminClient = { auth: { admin: {} } };
    const responseData = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 1,
        sort: { order: 'name', dir: SortDirection.Ascending },
      },
      data: [
        {
          id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: OrganisationStatus.Active,
        },
      ],
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    createAdminSupabaseClientMock.mockReturnValue(adminClient);
    listOrganisationsMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(GET, {
      path: '/api/admin/organisations',
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(responseData);
    expect(createOrganisationsServiceMock).toHaveBeenCalledWith(adminClient);
    expect(listOrganisationsMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      order: 'name',
      dir: SortDirection.Ascending,
    });
  });
});
