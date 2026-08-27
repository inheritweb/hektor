import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { Message } from '@hektor/messaging';
import { OrganisationBulkInvitationOutcome } from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';
import { organisationProvisionInvitationResultSchema } from '@hektor/types/contracts/organisations';

import { HektorServiceError } from '../errors';
import { createIntegrationDatabaseClient } from '../testing/local-supabase';

import { createOrganisationInvitationsService } from './organisation-invitations.service';

const client = createIntegrationDatabaseClient();

const organisationId = randomUUID();

const provisionId = randomUUID();

const revokedProvisionId = randomUUID();

const bulkProvisionId = randomUUID();

const sentMessages: Message[] = [];

const establishSession = vi.fn(async () => undefined);

const invitations = createOrganisationInvitationsService({
  client,
  messageSender: {
    send: async (message) => {
      sentMessages.push(message);
    },
  },
  resendCooldownSeconds: 60,
  webBaseUrl: 'http://localhost:3000',
});

describe('organisation invitation business rules', () => {
  beforeAll(async () => {
    const organisation = await client.from('organisations').insert({
      id: organisationId,
      name: 'Invitation Test University',
      slug: `invitation-${organisationId}`,
    });
    if (organisation.error) throw organisation.error;

    const provisions = await client
      .from('organisation_user_provisions')
      .insert([
        {
          id: provisionId,
          organisation_id: organisationId,
          provisioned_display_name: 'Invited Learner',
          provisioned_role: 'learner',
          provisioned_user_name: `invited-${provisionId}@integration.example`,
          provisioning_method: 'scim',
          status: 'pending',
        },
        {
          id: revokedProvisionId,
          organisation_id: organisationId,
          provisioned_role: 'learner',
          provisioned_user_name: `linked-${provisionId}@integration.example`,
          provisioning_method: 'scim',
          status: 'revoked',
          revoked_at: new Date().toISOString(),
        },
        {
          id: bulkProvisionId,
          organisation_id: organisationId,
          provisioned_display_name: 'Bulk Tutor',
          provisioned_role: 'tutor',
          provisioned_user_name: `bulk-${bulkProvisionId}@integration.example`,
          provisioning_method: 'csv',
          status: 'pending',
        },
      ]);
    if (provisions.error) throw provisions.error;
  });

  afterAll(async () => {
    await client
      .from('organisation_user_provisions')
      .delete()
      .eq('organisation_id', organisationId);
    await client.from('organisations').delete().eq('id', organisationId);
  });

  it('sends an opaque, expiring invitation without creating an account', async () => {
    const invitedEmail = `invited-${provisionId}@integration.example`;
    const accountsBefore = await client.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    const result = await invitations.sendInvitation({
      organisationId,
      provisionId,
    });

    const accountsAfter = await client.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const message = sentMessages.at(-1)!;
    const invitationUrl = invitationUrlFrom(message);
    const token = invitationUrl.searchParams.get('token')!;
    const stored = await client
      .from('organisation_user_provisions')
      .select('invitation_token_hash, invitation_send_count')
      .eq('id', provisionId)
      .single();

    expect(result.data.sendCount).toBe(1);
    expect(() =>
      organisationProvisionInvitationResultSchema.parse(result.data),
    ).not.toThrow();
    expect(result.data.sentAt).toMatch(/Z$/);
    expect(result.data.expiresAt).toMatch(/Z$/);
    expect(message.to).toContain('@integration.example');
    expect(message.html).toContain('Invitation Test University');
    expect(token).toBeTruthy();
    expect(stored.data?.invitation_token_hash).toHaveLength(64);
    expect(stored.data?.invitation_token_hash).not.toBe(token);
    expect(
      accountsBefore.data.users.some((user) => user.email === invitedEmail),
    ).toBe(false);
    expect(
      accountsAfter.data.users.some((user) => user.email === invitedEmail),
    ).toBe(false);
  });

  it('rejects an immediate resend and does not deliver another message', async () => {
    const messagesBefore = sentMessages.length;

    await expect(
      invitations.sendInvitation({ organisationId, provisionId }),
    ).rejects.toMatchObject({ code: HektorErrorCode.Conflict });
    expect(sentMessages).toHaveLength(messagesBefore);
  });

  it('does not establish a session for an invalid token', async () => {
    establishSession.mockClear();

    await expect(
      invitations.redeemInvitation({
        establishSession,
        provisionId,
        token: 'not-the-issued-token',
      }),
    ).rejects.toBeInstanceOf(HektorServiceError);
    expect(establishSession).not.toHaveBeenCalled();
  });

  it('establishes the intended identity once for a valid token', async () => {
    const invitationUrl = invitationUrlFrom(sentMessages.at(-1)!);
    const token = invitationUrl.searchParams.get('token')!;

    await invitations.redeemInvitation({
      establishSession,
      provisionId,
      token,
    });

    expect(establishSession).toHaveBeenCalledWith(
      `invited-${provisionId}@integration.example`,
    );
    await expect(
      invitations.redeemInvitation({ establishSession, provisionId, token }),
    ).rejects.toMatchObject({ code: HektorErrorCode.NotFound });
  });

  it('does not invite a provision that is no longer pending', async () => {
    await expect(
      invitations.sendInvitation({
        organisationId,
        provisionId: revokedProvisionId,
      }),
    ).rejects.toMatchObject({ code: HektorErrorCode.Conflict });
  });

  it('bulk sends eligible invitations and reports cooldowns and skipped states', async () => {
    const result = await invitations.sendInvitations(
      { organisationId },
      {
        selection: {
          ids: [bulkProvisionId, provisionId, revokedProvisionId],
          type: 'ids',
        },
      },
    );

    expect(result.data).toMatchObject({ failed: 1, sent: 1, skipped: 1 });
    expect(result.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          outcome: OrganisationBulkInvitationOutcome.Sent,
          provisionId: bulkProvisionId,
        }),
        expect.objectContaining({
          outcome: OrganisationBulkInvitationOutcome.Failed,
          provisionId,
        }),
        expect.objectContaining({
          outcome: OrganisationBulkInvitationOutcome.Skipped,
          provisionId: revokedProvisionId,
        }),
      ]),
    );
  });
});

function invitationUrlFrom(message: Message) {
  const match = message.text.match(/https?:\/\/\S+/);
  if (!match) throw new Error('invitation_url_missing');
  return new URL(match[0]);
}
