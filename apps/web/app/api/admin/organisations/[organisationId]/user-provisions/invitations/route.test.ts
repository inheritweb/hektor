import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { getUserMock, sendInvitationsMock, serviceMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  sendInvitationsMock: vi.fn(),
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
  createOrganisationInvitationsService: serviceMock,
}));

import { POST } from './route';

describe('POST bulk organisation provision invitations', () => {
  beforeEach(() => {
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    serviceMock.mockReturnValue({ sendInvitations: sendInvitationsMock });
  });

  it('uses the platform-admin invitation service', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const body = {
      selection: {
        ids: ['03d946de-8938-46d8-93a4-e3917df0928e'],
        type: 'ids' as const,
      },
    };
    sendInvitationsMock.mockResolvedValue({
      data: { failed: 0, items: [], sent: 1, skipped: 0 },
    });

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      params: { organisationId },
      path: `/api/admin/organisations/${organisationId}/user-provisions/invitations`,
    });

    expect(response.status).toBe(200);
    expect(sendInvitationsMock).toHaveBeenCalledWith({ organisationId }, body);
  });
});
