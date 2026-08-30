import { createHash, randomBytes } from 'node:crypto';

import {
  OrganisationRole,
  type OrganisationScimConfiguration,
  type OrganisationScimTokenResult,
} from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';

const endpointPath = '/api/scim/v2';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function mapConfiguration(
  record?: {
    default_role: string;
    token_created_at: string | null;
    token_hash: string | null;
    token_revoked_at: string | null;
    token_suffix: string | null;
    updated_at: string;
  } | null,
): OrganisationScimConfiguration {
  return {
    defaultRole:
      (record?.default_role as OrganisationRole | undefined) ??
      OrganisationRole.Learner,
    enabled: Boolean(record?.token_hash),
    endpointPath,
    ...(record?.token_created_at
      ? { tokenCreatedAt: new Date(record.token_created_at).toISOString() }
      : {}),
    ...(record?.token_revoked_at
      ? { tokenRevokedAt: new Date(record.token_revoked_at).toISOString() }
      : {}),
    ...(record?.token_suffix ? { tokenSuffix: record.token_suffix } : {}),
    ...(record?.updated_at
      ? { updatedAt: new Date(record.updated_at).toISOString() }
      : {}),
  };
}

export function createScimConfigurationService(client: DatabaseClient) {
  async function getConfiguration(
    organisationId: string,
  ): Promise<{ data: OrganisationScimConfiguration }> {
    const { data, error } = await client
      .from('organisation_scim_configurations')
      .select(
        'default_role, token_created_at, token_hash, token_revoked_at, token_suffix, updated_at',
      )
      .eq('organisation_id', organisationId)
      .maybeSingle();

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to load SCIM configuration',
        internalMessage: error.message,
        cause: error,
      });
    }

    return { data: mapConfiguration(data) };
  }

  async function updateConfiguration(
    organisationId: string,
    defaultRole: OrganisationRole,
  ): Promise<{ data: OrganisationScimConfiguration }> {
    const { error } = await client
      .from('organisation_scim_configurations')
      .upsert(
        { default_role: defaultRole, organisation_id: organisationId },
        { onConflict: 'organisation_id' },
      );

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to update SCIM configuration',
        internalMessage: error.message,
        cause: error,
      });
    }

    return getConfiguration(organisationId);
  }

  async function issueToken(
    organisationId: string,
  ): Promise<{ data: OrganisationScimTokenResult }> {
    const token = `hektor_scim_${randomBytes(32).toString('base64url')}`;
    const now = new Date().toISOString();
    const current = await getConfiguration(organisationId);
    const { data, error } = await client
      .from('organisation_scim_configurations')
      .upsert(
        {
          default_role: current.data.defaultRole,
          organisation_id: organisationId,
          token_created_at: now,
          token_hash: hashToken(token),
          token_revoked_at: null,
          token_suffix: token.slice(-4),
        },
        { onConflict: 'organisation_id' },
      )
      .select(
        'default_role, token_created_at, token_hash, token_revoked_at, token_suffix, updated_at',
      )
      .single();

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to issue SCIM token',
        internalMessage: error.message,
        cause: error,
      });
    }

    return { data: { ...mapConfiguration(data), token } };
  }

  async function revokeToken(
    organisationId: string,
  ): Promise<{ data: OrganisationScimConfiguration }> {
    const existing = await client
      .from('organisation_scim_configurations')
      .select('organisation_id')
      .eq('organisation_id', organisationId)
      .maybeSingle();
    if (existing.error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to revoke SCIM token',
        internalMessage: existing.error.message,
        cause: existing.error,
      });
    }
    if (existing.data) {
      const { error } = await client
        .from('organisation_scim_configurations')
        .update({
          token_hash: null,
          token_revoked_at: new Date().toISOString(),
          token_suffix: null,
        })
        .eq('organisation_id', organisationId);
      if (error) {
        throw createServiceError(HektorErrorCode.InternalServerError, {
          message: 'Unable to revoke SCIM token',
          internalMessage: error.message,
          cause: error,
        });
      }
    }

    return getConfiguration(organisationId);
  }

  return { getConfiguration, issueToken, revokeToken, updateConfiguration };
}

export function createScimTokenHash(token: string) {
  return hashToken(token);
}
