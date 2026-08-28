import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganisationRole, SortDirection } from '@hektor/types';
import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';

import { callApiEndpoint, expectApiError } from '@/tests/api/api-test-client';
import { HektorErrorCode } from '@hektor/types/contracts';

const {
  createAdminSupabaseClientMock,
  createOrganisationsServiceMock,
  getUserMock,
  listOrganisationUsersMock,
  rpcMock,
  fromMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createOrganisationsServiceMock: vi.fn(),
  getUserMock: vi.fn(),
  listOrganisationUsersMock: vi.fn(),
  rpcMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
    rpc: rpcMock,
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: createOrganisationsServiceMock,
}));

import { GET } from './route';

describe('GET /api/organisation/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createOrganisationsServiceMock.mockReturnValue({
      listOrganisationUsers: listOrganisationUsersMock,
    });
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-id', app_metadata: {} } },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: true, error: null });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { role: OrganisationRole.OrganisationAdmin },
      error: null,
    });
    const thirdEq = vi.fn().mockReturnValue({ maybeSingle });
    const secondEq = vi.fn().mockReturnValue({ eq: thirdEq });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: firstEq }),
    });
    listOrganisationUsersMock.mockResolvedValue({
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'displayName', dir: SortDirection.Ascending },
      },
      data: [],
    });
  });

  it('uses the verified tenant rather than an organisation request parameter', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const response = await callApiEndpoint(GET, {
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      path: '/api/organisation/users',
    });

    expect(response.status).toBe(200);
    expect(listOrganisationUsersMock).toHaveBeenCalledWith(
      { organisationId },
      {
        page: 1,
        pageSize: 20,
        order: 'displayName',
        dir: SortDirection.Ascending,
      },
    );
  });

  it('rejects a tutor even when the selected tenant is valid', async () => {
    rpcMock.mockResolvedValue({ data: false, error: null });

    await expectApiError(
      await callApiEndpoint(GET, {
        headers: {
          [HEKTOR_ORGANISATION_HEADER]: 'ab720a62-06df-408d-9e8c-0201ac69269a',
        },
      }),
      {
        code: HektorErrorCode.Forbidden,
        message: 'You do not have permission to perform this action',
      },
    );
    expect(listOrganisationUsersMock).not.toHaveBeenCalled();
  });
});
