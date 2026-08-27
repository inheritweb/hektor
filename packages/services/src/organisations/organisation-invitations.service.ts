import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import {
  organisationInvitationMessage,
  type MessageSender,
} from '@hektor/messaging';
import {
  OrganisationBulkInvitationOutcome,
  OrganisationStatus,
  ProvisioningStatus,
} from '@hektor/types';
import type {
  SendOrganisationProvisionInvitationsBody,
  SendOrganisationProvisionInvitationsParams,
  SendOrganisationProvisionInvitationsResponse,
} from '@hektor/types/contracts/organisations';
import { HektorErrorCode } from '@hektor/types/contracts';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';

import {
  buildOrganisationUserProvisionDetailQuery,
  buildProvisionAcceptanceQuery,
  clearOrganisationProvisionInvitationQuery,
  consumeOrganisationProvisionInvitationQuery,
  issueOrganisationProvisionInvitationQuery,
} from './organisations.queries';

export interface OrganisationInvitationServiceOptions {
  client: DatabaseClient;
  expiryHours?: number;
  messageSender: MessageSender;
  resendCooldownSeconds?: number;
  webBaseUrl: string;
}

export function createOrganisationInvitationsService({
  client,
  expiryHours = 24,
  messageSender,
  resendCooldownSeconds = 60,
  webBaseUrl,
}: OrganisationInvitationServiceOptions) {
  async function sendInvitation(options: {
    organisationId: string;
    provisionId: string;
  }) {
    const { data: provision, error: provisionError } =
      await buildOrganisationUserProvisionDetailQuery(
        client,
        options.organisationId,
        options.provisionId,
      );

    if (provisionError || !provision) {
      throw createServiceError(HektorErrorCode.NotFound, {
        message: 'Provisioned user not found',
        internalMessage: provisionError?.message,
        cause: provisionError,
      });
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = hashInvitationToken(token);
    const expiresAt = new Date(
      Date.now() + expiryHours * 60 * 60 * 1000,
    ).toISOString();
    const issued = await issueOrganisationProvisionInvitationQuery(client, {
      cooldownSeconds: resendCooldownSeconds,
      expiresAt,
      organisationId: options.organisationId,
      provisionId: options.provisionId,
      tokenHash,
    });

    if (issued.error) {
      const conflict =
        issued.error.message.includes('provision_not_pending') ||
        issued.error.message.includes('organisation_not_active') ||
        issued.error.message.includes('invitation_cooldown');
      throw createServiceError(
        conflict
          ? HektorErrorCode.Conflict
          : HektorErrorCode.InternalServerError,
        {
          message: issued.error.message.includes('invitation_cooldown')
            ? 'Please wait before resending this invitation'
            : 'This provision cannot currently be invited',
          internalMessage: issued.error.message,
          cause: issued.error,
        },
      );
    }

    const acceptUrl = new URL('/auth/invitation', webBaseUrl);
    acceptUrl.searchParams.set('provisionId', options.provisionId);
    acceptUrl.searchParams.set('token', token);

    try {
      await messageSender.send(
        organisationInvitationMessage({
          acceptUrl: acceptUrl.toString(),
          displayName: provision.provisioned_display_name ?? undefined,
          expiresInHours: expiryHours,
          organisationName: provision.organisation.name,
          to: provision.provisioned_user_name,
        }),
      );
    } catch (cause) {
      await clearOrganisationProvisionInvitationQuery(
        client,
        options.provisionId,
        tokenHash,
      );
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to send provision invitation',
        cause,
      });
    }

    return {
      data: {
        expiresAt: new Date(issued.data.invitation_expires_at!).toISOString(),
        sendCount: issued.data.invitation_send_count,
        sentAt: new Date(issued.data.invitation_sent_at!).toISOString(),
      },
    };
  }

  async function redeemInvitation(options: {
    establishSession: (email: string) => Promise<void>;
    provisionId: string;
    token: string;
  }) {
    const tokenHash = hashInvitationToken(options.token);
    const { data: provision, error } = await buildProvisionAcceptanceQuery(
      client,
      options.provisionId,
    );
    const storedHash = provision?.invitation_token_hash;
    const validHash =
      storedHash !== null &&
      storedHash !== undefined &&
      safeTokenHashEquals(storedHash, tokenHash);
    const valid =
      !error &&
      provision !== null &&
      validHash &&
      provision.status === ProvisioningStatus.Pending &&
      provision.organisation.status === OrganisationStatus.Active &&
      provision.invitation_consumed_at === null &&
      provision.invitation_expires_at !== null &&
      new Date(provision.invitation_expires_at).getTime() > Date.now();

    if (!valid || !provision) {
      throw createServiceError(HektorErrorCode.NotFound, {
        message: 'Invitation not found or expired',
        internalMessage: error?.message,
        cause: error,
      });
    }

    await options.establishSession(provision.provisioned_user_name);
    const consumed = await consumeOrganisationProvisionInvitationQuery(
      client,
      options.provisionId,
      tokenHash,
    );

    if (consumed.error) {
      throw createServiceError(HektorErrorCode.NotFound, {
        message: 'Invitation not found or expired',
        internalMessage: consumed.error.message,
        cause: consumed.error,
      });
    }

    return { data: { provisionId: consumed.data.id } };
  }

  async function sendInvitations(
    params: SendOrganisationProvisionInvitationsParams,
    body: SendOrganisationProvisionInvitationsBody,
  ): Promise<SendOrganisationProvisionInvitationsResponse> {
    let query = client
      .from('organisation_user_provisions')
      .select(
        'id, provisioned_user_name, provisioned_display_name, provisioned_role, provisioning_method, status',
      )
      .eq('organisation_id', params.organisationId);

    if (body.selection.type === 'ids') {
      query = query.in('id', body.selection.ids);
    } else {
      query = query.eq('status', ProvisioningStatus.Pending);
      if (body.selection.role)
        query = query.eq('provisioned_role', body.selection.role);
      if (body.selection.provisioningMethod)
        query = query.eq(
          'provisioning_method',
          body.selection.provisioningMethod,
        );
      if (body.selection.query) {
        const search = body.selection.query.replaceAll(/[,%()]/g, '');
        query = query.or(
          `provisioned_user_name.ilike.%${search}%,provisioned_display_name.ilike.%${search}%`,
        );
      }
      query = query.limit(501);
    }

    const selected = await query;
    if (selected.error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to resolve invitation recipients',
        internalMessage: selected.error.message,
        cause: selected.error,
      });
    }
    if (selected.data.length > 500) {
      throw createServiceError(HektorErrorCode.BadRequest, {
        message: 'Narrow the selection to 500 provisioned users or fewer',
      });
    }

    const items: SendOrganisationProvisionInvitationsResponse['data']['items'] =
      [];
    if (body.selection.type === 'ids') {
      const foundIds = new Set(selected.data.map(({ id }) => id));
      for (const provisionId of body.selection.ids) {
        if (!foundIds.has(provisionId)) {
          items.push({
            message: 'Provisioned user was not found in this organisation',
            outcome: OrganisationBulkInvitationOutcome.Skipped,
            provisionId,
          });
        }
      }
    }

    const pending = [];
    for (const provision of selected.data) {
      if (provision.status !== ProvisioningStatus.Pending) {
        items.push({
          email: provision.provisioned_user_name,
          message: 'Only pending provisions can receive invitations',
          outcome: OrganisationBulkInvitationOutcome.Skipped,
          provisionId: provision.id,
        });
      } else pending.push(provision);
    }

    await mapWithConcurrency(pending, 5, async (provision) => {
      try {
        await sendInvitation({
          organisationId: params.organisationId,
          provisionId: provision.id,
        });
        items.push({
          email: provision.provisioned_user_name,
          outcome: OrganisationBulkInvitationOutcome.Sent,
          provisionId: provision.id,
        });
      } catch (error) {
        items.push({
          email: provision.provisioned_user_name,
          message:
            error instanceof Error
              ? error.message
              : 'Unable to send invitation',
          outcome: OrganisationBulkInvitationOutcome.Failed,
          provisionId: provision.id,
        });
      }
    });

    return {
      data: {
        failed: items.filter(
          ({ outcome }) => outcome === OrganisationBulkInvitationOutcome.Failed,
        ).length,
        items,
        sent: items.filter(
          ({ outcome }) => outcome === OrganisationBulkInvitationOutcome.Sent,
        ).length,
        skipped: items.filter(
          ({ outcome }) =>
            outcome === OrganisationBulkInvitationOutcome.Skipped,
        ).length,
      },
    };
  }

  return { redeemInvitation, sendInvitation, sendInvitations };
}

async function mapWithConcurrency<T>(
  values: T[],
  concurrency: number,
  callback: (value: T) => Promise<void>,
) {
  let index = 0;
  const worker = async () => {
    while (index < values.length) {
      const value = values[index];
      index += 1;
      if (value !== undefined) await callback(value);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, worker),
  );
}

function hashInvitationToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function safeTokenHashEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
