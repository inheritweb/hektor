import {
  type CohortSummary,
  GroupStatus,
  type Organisation,
  type OrganisationContractPeriod,
  type OrganisationGroupSummary,
  type OrganisationMembershipUserSummary,
  type OrganisationSummary,
  type OrganisationUsersSummary,
  OrganisationStatus,
  OrganisationRole,
  OrganisationUserStatus,
  ScimResourceStatus,
} from '@hektor/types';
import type {
  OrganisationDetailQueryResult,
  OrganisationSummaryQueryResult,
  OrganisationUsersQueryResult,
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

function mapContractPeriod(
  record: OrganisationDetailQueryResult['contractPeriods'][number],
): OrganisationContractPeriod {
  const activated = record.activations.length;
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

function mapCohortSummary(
  record: OrganisationDetailQueryResult['cohorts'][number],
): CohortSummary {
  return {
    id: record.id,
    name: record.name,
    startsOn: record.starts_on,
    endsOn: record.ends_on,
    status: record.status as GroupStatus,
  };
}

function mapGroupSummary(
  record: OrganisationDetailQueryResult['groups'][number],
): OrganisationGroupSummary {
  return {
    id: record.id,
    name: record.name,
    status: record.status as GroupStatus,
  };
}

export function mapOrganisation(
  record: OrganisationDetailQueryResult,
  usersSummary: OrganisationUsersSummary,
): Organisation {
  return {
    ...mapOrganisationSummary(record),
    contractPeriods: record.contractPeriods.map(mapContractPeriod),
    cohorts: record.cohorts.map(mapCohortSummary),
    groups: record.groups.map(mapGroupSummary),
    usersSummary,
    createdAt: mapDateTime(record.created_at),
    updatedAt: mapDateTime(record.updated_at),
  };
}

export function mapOrganisationUserSummary(
  record: OrganisationUsersQueryResult[number],
): OrganisationMembershipUserSummary {
  return {
    id: record.id,
    userId: record.user_id ?? undefined,
    userName: record.user_name,
    displayName: record.display_name ?? undefined,
    role: record.role as OrganisationRole,
    status: record.status as OrganisationUserStatus,
    scimStatus: record.scim_status as ScimResourceStatus,
    linked: record.user_id !== null,
  };
}
