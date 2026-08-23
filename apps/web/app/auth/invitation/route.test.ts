import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { establishSessionMock, redeemInvitationMock } = vi.hoisted(() => ({
  establishSessionMock: vi.fn(),
  redeemInvitationMock: vi.fn(),
}));

vi.mock('@/env', () => ({ env: { PUBLIC_BASE_URL: 'http://localhost:3000' } }));

vi.mock('@/lib/auth/establish-email-session', () => ({
  establishEmailSession: establishSessionMock,
}));

vi.mock('@/lib/messaging', () => ({ createMessageSender: () => ({}) }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({}),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({}),
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationInvitationsService: () => ({
    redeemInvitation: redeemInvitationMock,
  }),
}));

import { GET } from './route';

describe('GET invitation callback', () => {
  beforeEach(() => {
    redeemInvitationMock.mockReset();
    establishSessionMock.mockReset();
    redeemInvitationMock.mockImplementation(
      async ({
        establishSession,
      }: {
        establishSession: (email: string) => Promise<void>;
      }) => establishSession('invited@example.com'),
    );
  });

  it('establishes a session and continues to explicit membership acceptance', async () => {
    const provisionId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const response = await GET(
      new NextRequest(
        `http://localhost:3000/auth/invitation?provisionId=${provisionId}&token=opaque`,
      ),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      `http://localhost:3000/provisioning/accept/${provisionId}`,
    );
    expect(redeemInvitationMock).toHaveBeenCalledWith(
      expect.objectContaining({ provisionId, token: 'opaque' }),
    );
    expect(establishSessionMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'invited@example.com',
    );
  });

  it('uses one generic unavailable page for invalid or expired invitations', async () => {
    redeemInvitationMock.mockRejectedValue(new Error('invalid'));

    const response = await GET(
      new NextRequest(
        'http://localhost:3000/auth/invitation?provisionId=invalid&token=bad',
      ),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/auth/invitation/unavailable',
    );
  });
});
