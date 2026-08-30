import { ScimGroupTargetType } from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';

export async function assertNoScimCohortConflict(
  client: DatabaseClient,
  organisationId: string,
  mappingId: string,
  targetCohortId: string,
  proposedMemberIds?: readonly string[],
) {
  const otherMappings = await client
    .from('organisation_scim_group_mappings')
    .select('id, organisation_cohort_id')
    .eq('organisation_id', organisationId)
    .eq('target_type', ScimGroupTargetType.Cohort)
    .is('source_deleted_at', null)
    .neq('id', mappingId)
    .neq('organisation_cohort_id', targetCohortId);
  if (otherMappings.error)
    throw createServiceError(HektorErrorCode.InternalServerError, {
      message: 'Unable to validate SCIM cohort ownership',
      internalMessage: otherMappings.error.message,
    });
  if (!otherMappings.data.length) return;

  let memberIds = proposedMemberIds ? [...proposedMemberIds] : undefined;
  if (!memberIds) {
    const members = await client
      .from('organisation_scim_group_members')
      .select('organisation_scim_user_id')
      .eq('organisation_scim_group_mapping_id', mappingId);
    if (members.error)
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to validate SCIM cohort ownership',
        internalMessage: members.error.message,
      });
    memberIds = members.data.map(
      ({ organisation_scim_user_id }) => organisation_scim_user_id,
    );
  }
  if (!memberIds.length) return;

  const overlap = await client
    .from('organisation_scim_group_members')
    .select('organisation_scim_user_id')
    .in(
      'organisation_scim_group_mapping_id',
      otherMappings.data.map(({ id }) => id),
    )
    .in('organisation_scim_user_id', memberIds)
    .limit(1);
  if (overlap.error)
    throw createServiceError(HektorErrorCode.InternalServerError, {
      message: 'Unable to validate SCIM cohort ownership',
      internalMessage: overlap.error.message,
    });
  if (overlap.data.length)
    throw createServiceError(HektorErrorCode.Conflict, {
      message:
        'A user cannot be assigned to different cohorts by multiple SCIM groups',
    });
}
