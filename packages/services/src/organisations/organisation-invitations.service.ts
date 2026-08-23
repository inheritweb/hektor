import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import {
  organisationInvitationMessage,
  type MessageSender,
} from '@hektor/messaging';
import { OrganisationStatus, ProvisioningStatus } from '@hektor/types';
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

  return { redeemInvitation, sendInvitation };
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
