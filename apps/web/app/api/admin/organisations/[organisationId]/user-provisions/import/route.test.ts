import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganisationRole, PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { commitMock, getUserMock, invitationServiceMock, serviceMock } =
  vi.hoisted(() => ({
    commitMock: vi.fn(),
    getUserMock: vi.fn(),
    invitationServiceMock: vi.fn(),
    serviceMock: vi.fn(),
  }));

vi.mock('@/env', () => ({ env: { PUBLIC_BASE_URL: 'http://localhost:3000' } }));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ auth: { admin: {} } }),
}));

vi.mock('@/lib/messaging', () => ({ createMessageSender: () => ({}) }));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationInvitationsService: invitationServiceMock,
  createOrganisationsService: serviceMock,
}));

import { POST } from './route';

describe('POST organisation provision import', () => {
  beforeEach(() => {
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    serviceMock.mockReturnValue({
      commitOrganisationProvisionImport: commitMock,
    });
    invitationServiceMock.mockReturnValue({ sendInvitation: vi.fn() });
  });

  it('commits validated rows through the platform-admin service', async () => {
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
      sendInvitations: false,
    };
    commitMock.mockResolvedValue({
      data: {
        created: 1,
        invitationsFailed: 0,
        invitationsSent: 0,
        linked: 0,
        unchanged: 0,
      },
    });

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      params: { organisationId },
      path: `/api/admin/organisations/${organisationId}/user-provisions/import`,
    });

    expect(response.status).toBe(200);
    expect(commitMock).toHaveBeenCalledWith(
      { organisationId },
      body,
      expect.any(Function),
    );
  });
});
