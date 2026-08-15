import {
  type CohortSummary,
  GroupStatus,
  type Organisation,
  type OrganisationContractPeriod,
  type OrganisationSummary,
  OrganisationStatus,
} from '@hektor/types';
import type {
  OrganisationDetailQueryResult,
  OrganisationSummaryQueryResult,
} from './organisations.queries';

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
    createdAt: record.created_at,
    updatedAt: record.updated_at,
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

export function mapOrganisation(
  record: OrganisationDetailQueryResult,
): Organisation {
  return {
    ...mapOrganisationSummary(record),
    contractPeriods: record.contractPeriods.map(mapContractPeriod),
    cohorts: record.cohorts.map(mapCohortSummary),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}
