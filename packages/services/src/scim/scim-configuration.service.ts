import { createHash, randomBytes } from 'node:crypto';

import {
  OrganisationRole,
  type OrganisationScimConfiguration,
  type OrganisationScimGroupMapping,
  type OrganisationScimTokenResult,
  ScimGroupTargetType,
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
  async function listGroupMappings(organisationId: string): Promise<{
    data: OrganisationScimGroupMapping[];
  }> {
    const mappings = await client
      .from('organisation_scim_group_mappings')
      .select(
        'display_name, external_id, id, last_synchronized_at, organisation_cohort_id, organisation_group_id, source_deleted_at, target_type',
      )
      .eq('organisation_id', organisationId)
      .order('display_name');
    if (mappings.error)
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to load SCIM groups',
        internalMessage: mappings.error.message,
      });
    const members = await client
      .from('organisation_scim_group_members')
      .select('organisation_scim_group_mapping_id')
      .eq('organisation_id', organisationId);
    const cohorts = await client
      .from('organisation_cohorts')
      .select('id, name')
      .eq('organisation_id', organisationId);
    const groups = await client
      .from('organisation_groups')
      .select('id, name')
      .eq('organisation_id', organisationId);
    if (members.error || cohorts.error || groups.error)
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to resolve SCIM group mappings',
      });
    const memberCounts = new Map<string, number>();
    for (const member of members.data)
      memberCounts.set(
        member.organisation_scim_group_mapping_id,
        (memberCounts.get(member.organisation_scim_group_mapping_id) ?? 0) + 1,
      );
    const cohortNames = new Map(
      cohorts.data.map((item) => [item.id, item.name]),
    );
    const groupNames = new Map(groups.data.map((item) => [item.id, item.name]));
    const data = mappings.data.map((mapping): OrganisationScimGroupMapping => {
      const target =
        mapping.target_type === ScimGroupTargetType.Cohort &&
        mapping.organisation_cohort_id
          ? {
              id: mapping.organisation_cohort_id,
              name:
                cohortNames.get(mapping.organisation_cohort_id) ??
                'Unknown cohort',
              type: ScimGroupTargetType.Cohort as const,
            }
          : mapping.target_type === ScimGroupTargetType.Group &&
              mapping.organisation_group_id
            ? {
                id: mapping.organisation_group_id,
                name:
                  groupNames.get(mapping.organisation_group_id) ??
                  'Unknown group',
                type: ScimGroupTargetType.Group as const,
              }
            : undefined;
      return {
        displayName: mapping.display_name,
        ...(mapping.external_id ? { externalId: mapping.external_id } : {}),
        id: mapping.id,
        lastSynchronizedAt: new Date(
          mapping.last_synchronized_at,
        ).toISOString(),
        memberCount: memberCounts.get(mapping.id) ?? 0,
        ...(mapping.source_deleted_at
          ? {
              sourceDeletedAt: new Date(
                mapping.source_deleted_at,
              ).toISOString(),
            }
          : {}),
        ...(target ? { target } : {}),
      };
    });
    return { data };
  }

  async function updateGroupMapping(
    organisationId: string,
    mappingId: string,
    target: { targetId: string | null; targetType: ScimGroupTargetType | null },
  ): Promise<{ data: OrganisationScimGroupMapping }> {
    if (target.targetType && target.targetId) {
      const table =
        target.targetType === ScimGroupTargetType.Cohort
          ? 'organisation_cohorts'
          : 'organisation_groups';
      const match = await client
        .from(table)
        .select('id')
        .eq('organisation_id', organisationId)
        .eq('id', target.targetId)
        .eq('status', 'active')
        .maybeSingle();
      if (match.error || !match.data)
        throw createServiceError(HektorErrorCode.UnprocessableEntity, {
          message:
            'The selected mapping target is not active in this organisation',
        });
    }
    const result = await client
      .from('organisation_scim_group_mappings')
      .update({
        organisation_cohort_id:
          target.targetType === ScimGroupTargetType.Cohort
            ? target.targetId
            : null,
        organisation_group_id:
          target.targetType === ScimGroupTargetType.Group
            ? target.targetId
            : null,
        target_type: target.targetType,
      })
      .eq('organisation_id', organisationId)
      .eq('id', mappingId)
      .select('id')
      .maybeSingle();
    if (result.error || !result.data)
      throw createServiceError(
        result.data
          ? HektorErrorCode.InternalServerError
          : HektorErrorCode.NotFound,
        {
          message: result.data
            ? 'Unable to update SCIM group mapping'
            : 'SCIM group not found',
        },
      );
    const applied = await client.rpc('apply_scim_group_mapping', {
      target_mapping_id: mappingId,
      target_organisation_id: organisationId,
    });
    if (applied.error)
      throw createServiceError(HektorErrorCode.UnprocessableEntity, {
        message: 'Unable to apply SCIM group mapping',
        internalMessage: applied.error.message,
      });
    const mappings = await listGroupMappings(organisationId);
    return { data: mappings.data.find(({ id }) => id === mappingId)! };
  }

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

  return {
    getConfiguration,
    issueToken,
    listGroupMappings,
    revokeToken,
    updateConfiguration,
    updateGroupMapping,
  };
}

export function createScimTokenHash(token: string) {
  return hashToken(token);
}
