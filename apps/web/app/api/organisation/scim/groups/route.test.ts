import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole } from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { fromMock, getUserMock, listMock, rpcMock, serviceMock } = vi.hoisted(
  () => ({
    fromMock: vi.fn(),
    getUserMock: vi.fn(),
    listMock: vi.fn(),
    rpcMock: vi.fn(),
    serviceMock: vi.fn(),
  }),
);

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
    rpc: rpcMock,
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/scim', () => ({
  createScimConfigurationService: serviceMock,
}));

import { GET } from './route';

describe('GET /api/organisation/scim/groups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({ listGroupMappings: listMock });
    getUserMock.mockResolvedValue({
      data: { user: { id: 'actor-user', app_metadata: {} } },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: true, error: null });
    allowRole();
  });

  it('passes pagination and filters only to the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    listMock.mockResolvedValue({
      context: {
        page: 2,
        pageSize: 20,
        sort: { dir: SortDirection.Ascending, order: 'displayName' },
        totalRecords: 21,
      },
      data: [],
    });
    const response = await callApiEndpoint(GET, {
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      query: {
        dir: 'asc',
        order: 'displayName',
        page: '2',
        pageSize: '20',
        search: 'clinical',
        status: 'unmapped',
      },
    });

    expect(response.status).toBe(200);
    expect(listMock).toHaveBeenCalledWith(
      organisationId,
      expect.objectContaining({
        page: 2,
        search: 'clinical',
        status: 'unmapped',
      }),
    );
  });
});

function allowRole() {
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
}
