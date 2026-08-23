import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createServiceMock, getUserMock, sendInvitationMock } = vi.hoisted(
  () => ({
    createServiceMock: vi.fn(),
    getUserMock: vi.fn(),
    sendInvitationMock: vi.fn(),
  }),
);

vi.mock('@/env', () => ({ env: { PUBLIC_BASE_URL: 'http://localhost:3000' } }));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ auth: { admin: {} } }),
}));

vi.mock('@/lib/messaging', () => ({ createMessageSender: () => ({}) }));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationInvitationsService: createServiceMock,
}));

import { POST } from './route';

describe('POST organisation provision invitation', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({ sendInvitation: sendInvitationMock });
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    sendInvitationMock.mockResolvedValue({
      data: {
        expiresAt: '2026-08-24T10:00:00.000Z',
        sendCount: 1,
        sentAt: '2026-08-23T10:00:00.000Z',
      },
    });
  });

  it('requires platform admin access and sends the selected invitation', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const provisionId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const response = await callApiEndpoint(POST, {
      body: {},
      method: 'POST',
      params: { organisationId, provisionId },
      path: `/api/admin/organisations/${organisationId}/user-provisions/${provisionId}/invitation`,
    });

    expect(response.status).toBe(200);
    expect(sendInvitationMock).toHaveBeenCalledWith({
      organisationId,
      provisionId,
    });
  });
});
