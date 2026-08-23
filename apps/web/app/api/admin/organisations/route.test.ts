import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganisationStatus, PlatformRole } from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createAdminSupabaseClientMock,
  createOrganisationsServiceMock,
  createOrganisationMock,
  getUserMock,
  listOrganisationsMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createOrganisationsServiceMock: vi.fn(),
  createOrganisationMock: vi.fn(),
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

import { GET, POST } from './route';

describe('GET /api/admin/organisations', () => {
  beforeEach(() => {
    createAdminSupabaseClientMock.mockReset();
    createOrganisationsServiceMock.mockReturnValue({
      createOrganisation: createOrganisationMock,
      listOrganisations: listOrganisationsMock,
    });
    getUserMock.mockReset();
    listOrganisationsMock.mockReset();
  });

  it('creates a validated organisation for a platform admin', async () => {
    const body = { name: 'New University', slug: 'new-university' };
    const data = {
      id: '03d946de-8938-46d8-93a4-e3917df0928e',
      ...body,
      status: OrganisationStatus.Active,
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    createOrganisationMock.mockResolvedValue({ data });

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      path: '/api/admin/organisations',
    });

    expect(response.status).toBe(200);
    expect(createOrganisationMock).toHaveBeenCalledWith(body);
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
      archived: false,
      page: 1,
      pageSize: 20,
      order: 'name',
      dir: SortDirection.Ascending,
    });
  });
});
