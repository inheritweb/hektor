import {
  type Organisation,
  type OrganisationCohort,
  type OrganisationCohortSummary,
  type OrganisationContractPeriod,
  type OrganisationGroup,
  type OrganisationGroupProvisionedUserSummary,
  type OrganisationGroupSummary,
  type OrganisationMembershipUserSummary,
  type OrganisationMembership,
  type OrganisationSummary,
  type OrganisationUserProvision,
  type OrganisationUserProvisionDetail,
  type OrganisationUserProvisionsSummary,
  type OrganisationUsersSummary,
  GroupStatus,
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
  ProvisioningMethod,
  ProvisioningStatus,
  type UserSummary,
} from '@hektor/types';

import type {
  OrganisationCohortsQueryResult,
  OrganisationCohortDetailQueryResult,
  OrganisationDetailQueryResult,
  OrganisationContractPeriodsQueryResult,
  OrganisationContractPeriodQueryResult,
  OrganisationGroupsQueryResult,
  OrganisationGroupDetailQueryResult,
  OrganisationMembershipsQueryResult,
  OrganisationMembershipDetailQueryResult,
  OrganisationSummaryQueryResult,
  OrganisationUserProvisionsQueryResult,
  OrganisationUserProvisionDetailQueryResult,
} from './organisations.queries';

function mapDateTime(value: string) {
  return new Date(value).toISOString();
}

export function mapOrganisationSummary(
  record: OrganisationSummaryQueryResult,
): OrganisationSummary {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    status: record.status as OrganisationStatus,
  };
}

export function mapOrganisationContractPeriod(
  record:
    | OrganisationDetailQueryResult['contractPeriods'][number]
    | OrganisationContractPeriodsQueryResult[number]
    | OrganisationContractPeriodQueryResult,
): OrganisationContractPeriod {
  const activated = record.activations.filter(
    (activation) => !activation.released_at,
  ).length;
  return {
    id: record.id,
    startsOn: record.starts_on,
    endsOn: record.ends_on,
    seats: {
      allowed: record.learner_seat_allowance,
      activated,
      remaining: Math.max(record.learner_seat_allowance - activated, 0),
    },
    createdAt: mapDateTime(record.created_at),
    updatedAt: mapDateTime(record.updated_at),
  };
}

export function mapOrganisationCohortSummary(
  record:
    | OrganisationDetailQueryResult['cohorts'][number]
    | OrganisationCohortsQueryResult[number],
): OrganisationCohortSummary {
  return {
    id: record.id,
    name: record.name,
    startsOn: record.starts_on,
    endsOn: record.ends_on,
    status: record.status as GroupStatus,
  };
}

export function mapOrganisationCohort(
  record: OrganisationCohortDetailQueryResult,
  learners: OrganisationMembershipUserSummary[],
): OrganisationCohort {
  return {
    ...mapOrganisationCohortSummary(record),
    organisation: mapOrganisationSummary(record.organisation),
    groups: record.groups.map(mapOrganisationGroupSummary),
    learners,
    createdAt: mapDateTime(record.created_at),
    updatedAt: mapDateTime(record.updated_at),
  };
}

export function mapOrganisationGroupSummary(
  record:
    | OrganisationGroupsQueryResult[number]
    | OrganisationDetailQueryResult['groups'][number]
    | OrganisationCohortDetailQueryResult['groups'][number],
): OrganisationGroupSummary {
  return {
    id: record.id,
    name: record.name,
    status: record.status as GroupStatus,
    provisioningMethod:
      (record.provisioning_method as ProvisioningMethod | null) ?? undefined,
    sourceExternalId: record.source_external_id ?? undefined,
  };
}

export function mapOrganisationGroup(
  record: OrganisationGroupDetailQueryResult,
  users: OrganisationMembershipUserSummary[],
): OrganisationGroup {
  const provisionedUsers: OrganisationGroupProvisionedUserSummary[] =
    record.provisionLinks
      .filter(
        ({ provision }) => provision.status === ProvisioningStatus.Pending,
      )
      .map(({ provision }) => ({
        id: provision.id,
        provisioningMethod: provision.provisioning_method as ProvisioningMethod,
        provisionedDisplayName: provision.provisioned_display_name ?? undefined,
        provisionedRole: provision.provisioned_role as OrganisationRole,
        provisionedUserName: provision.provisioned_user_name,
        status: provision.status as ProvisioningStatus,
      }));

  return {
    ...mapOrganisationGroupSummary(record),
    organisation: mapOrganisationSummary(record.organisation),
    cohort: record.cohort
      ? mapOrganisationCohortSummary(record.cohort)
      : undefined,
    users,
    provisionedUsers,
    lastSynchronizedAt: record.last_synchronized_at
      ? mapDateTime(record.last_synchronized_at)
      : undefined,
    sourceDeletedAt: record.source_deleted_at
      ? mapDateTime(record.source_deleted_at)
      : undefined,
    createdAt: mapDateTime(record.created_at),
    updatedAt: mapDateTime(record.updated_at),
  };
}

export function mapOrganisation(
  record: OrganisationDetailQueryResult,
  usersSummary: OrganisationUsersSummary,
  userProvisionsSummary: OrganisationUserProvisionsSummary,
): Organisation {
  return {
    ...mapOrganisationSummary(record),
    contractPeriods: record.contractPeriods.map(mapOrganisationContractPeriod),
    cohorts: record.cohorts.map(mapOrganisationCohortSummary),
    groups: record.groups.map(mapOrganisationGroupSummary),
    usersSummary,
    userProvisionsSummary,
    createdAt: mapDateTime(record.created_at),
    updatedAt: mapDateTime(record.updated_at),
  };
}

export function mapOrganisationMembershipUserSummary(
  record: Pick<
    OrganisationMembershipsQueryResult[number],
    'id' | 'role' | 'status'
  >,
  user: UserSummary,
): OrganisationMembershipUserSummary {
  return {
    id: record.id,
    user,
    role: record.role as OrganisationRole,
    status: record.status as OrganisationUserStatus,
  };
}

export function mapOrganisationMembership(
  record: OrganisationMembershipDetailQueryResult,
  user: UserSummary,
): OrganisationMembership {
  const provision = record.provisions
    .filter(({ status }) =>
      [ProvisioningStatus.Linked, ProvisioningStatus.Inactive].includes(
        status as ProvisioningStatus,
      ),
    )
    .sort((left, right) => right.created_at.localeCompare(left.created_at))[0];
  const seatActivation = record.seatActivations.find(
    ({ released_at }) => !released_at,
  );

  return {
    id: record.id,
    user,
    role: record.role as OrganisationRole,
    status: record.status as OrganisationUserStatus,
    organisation: mapOrganisationSummary(record.organisation),
    cohort: record.cohort
      ? mapOrganisationCohortSummary(record.cohort)
      : undefined,
    groups: record.groupLinks.map(({ group }) =>
      mapOrganisationGroupSummary(group),
    ),
    provisioning: provision
      ? {
          id: provision.id,
          method: provision.provisioning_method as ProvisioningMethod,
          status: provision.status as ProvisioningStatus,
        }
      : undefined,
    seatActivation: seatActivation
      ? {
          activatedAt: mapDateTime(seatActivation.activated_at),
          contractPeriodId: seatActivation.organisation_contract_period_id,
        }
      : undefined,
    createdAt: mapDateTime(record.created_at),
    updatedAt: mapDateTime(record.updated_at),
  };
}

export function mapOrganisationUserProvision(
  record: OrganisationUserProvisionsQueryResult[number],
): OrganisationUserProvision {
  return {
    id: record.id,
    organisation: {
      id: record.organisation.id,
      name: record.organisation.name,
      slug: record.organisation.slug,
      status: record.organisation.status as OrganisationStatus,
    },
    cohort: record.cohort
      ? {
          id: record.cohort.id,
          name: record.cohort.name,
          startsOn: record.cohort.starts_on,
          endsOn: record.cohort.ends_on,
          status: record.cohort.status as GroupStatus,
        }
      : undefined,
    groups: record.groupLinks.map(({ group }) =>
      mapOrganisationGroupSummary(group),
    ),
    organisationUserId: record.organisation_user_id ?? undefined,
    provisioningMethod: record.provisioning_method as ProvisioningMethod,
    sourceExternalId: record.source_external_id ?? undefined,
    provisionedUserName: record.provisioned_user_name,
    provisionedDisplayName: record.provisioned_display_name ?? undefined,
    provisionedGivenName: record.provisioned_given_name ?? undefined,
    provisionedFamilyName: record.provisioned_family_name ?? undefined,
    provisionedRole: record.provisioned_role as OrganisationRole,
    status: record.status as ProvisioningStatus,
    lastSynchronizedAt: record.last_synchronized_at
      ? mapDateTime(record.last_synchronized_at)
      : undefined,
    linkedAt: record.linked_at ? mapDateTime(record.linked_at) : undefined,
    revokedAt: record.revoked_at ? mapDateTime(record.revoked_at) : undefined,
    invitationSentAt: record.invitation_sent_at
      ? mapDateTime(record.invitation_sent_at)
      : undefined,
    invitationExpiresAt: record.invitation_expires_at
      ? mapDateTime(record.invitation_expires_at)
      : undefined,
    invitationConsumedAt: record.invitation_consumed_at
      ? mapDateTime(record.invitation_consumed_at)
      : undefined,
    invitationSendCount: record.invitation_send_count,
    createdAt: mapDateTime(record.created_at),
    updatedAt: mapDateTime(record.updated_at),
  };
}

export function mapOrganisationUserProvisionDetail(
  record: OrganisationUserProvisionDetailQueryResult,
  linkedUser?: UserSummary,
): OrganisationUserProvisionDetail {
  return {
    ...mapOrganisationUserProvision(record),
    linkedUser,
  };
}
