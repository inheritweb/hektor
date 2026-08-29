import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole, ProvisioningStatus } from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  commitImportMock,
  createInvitationsMock,
  fromMock,
  getUserMock,
  listProvisionsMock,
  rpcMock,
  sendInvitationMock,
  serviceMock,
} = vi.hoisted(() => ({
  commitImportMock: vi.fn(),
  createInvitationsMock: vi.fn(),
  fromMock: vi.fn(),
  getUserMock: vi.fn(),
  listProvisionsMock: vi.fn(),
  rpcMock: vi.fn(),
  sendInvitationMock: vi.fn(),
  serviceMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
    rpc: rpcMock,
  }),
}));

vi.mock('@/env', () => ({ env: { PUBLIC_BASE_URL: 'http://localhost:3000' } }));

vi.mock('@/lib/messaging', () => ({ createMessageSender: vi.fn() }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationInvitationsService: createInvitationsMock,
  createOrganisationsService: serviceMock,
}));

import { GET, POST } from './route';

describe('GET /api/organisation/user-provisions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      commitOrganisationProvisionImport: commitImportMock,
      listOrganisationUserProvisions: listProvisionsMock,
    });
    createInvitationsMock.mockReturnValue({
      sendInvitation: sendInvitationMock,
    });
    commitImportMock.mockResolvedValue({
      data: {
        created: 0,
        invitationsFailed: 0,
        invitationsSent: 0,
        linked: 1,
        unchanged: 0,
      },
    });
    getUserMock.mockResolvedValue({
      data: { user: { id: 'actor-user', app_metadata: {} } },
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
    listProvisionsMock.mockResolvedValue({
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'displayName', dir: SortDirection.Ascending },
      },
      data: [],
    });
  });

  it('lists only provisions from the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const query = {
      page: 1,
      pageSize: 20,
      order: 'displayName',
      dir: SortDirection.Ascending,
      status: ProvisioningStatus.Pending,
    };

    const response = await callApiEndpoint(GET, {
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      query,
    });

    expect(response.status).toBe(200);
    expect(listProvisionsMock).toHaveBeenCalledWith({ organisationId }, query);
  });

  it('accepts a tenant provision without disclosing reconciliation', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const body = {
      email: 'existing@example.com',
      firstName: 'Existing',
      lastName: 'Person',
      role: OrganisationRole.Tutor,
      sendInvitation: true,
    };

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { accepted: true },
    });
    expect(commitImportMock).toHaveBeenCalledWith(
      { organisationId },
      {
        rows: [
          {
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            role: body.role,
            rowNumber: 1,
          },
        ],
        sendInvitations: true,
      },
      expect.any(Function),
    );
  });
});
