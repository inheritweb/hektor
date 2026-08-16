import type { QueryData } from '@supabase/supabase-js';

import type {
  OrganisationRole,
  OrganisationUserStatus,
  ProvisioningStatus,
} from '@hektor/types';

import type { DatabaseClient } from '../database';

export function buildOrganisationSummariesQuery(
  client: DatabaseClient,
  options: {
    page: number;
    pageSize: number;
    order: 'name' | 'createdAt';
    dir: 'asc' | 'desc';
  },
) {
  const first = (options.page - 1) * options.pageSize;
  const order = options.order === 'createdAt' ? 'created_at' : 'name';

  return client
    .from('organisations')
    .select('id, name, slug, status', { count: 'exact' })
    .order(order, { ascending: options.dir === 'asc' })
    .range(first, first + options.pageSize - 1);
}

export type OrganisationSummariesQueryResult = QueryData<
  ReturnType<typeof buildOrganisationSummariesQuery>
>;

export type OrganisationSummaryQueryResult =
  OrganisationSummariesQueryResult[number];

export function buildOrganisationDetailQuery(
  client: DatabaseClient,
  organisationId: string,
) {
  return client
    .from('organisations')
    .select(
      `
    id, name, slug, status, created_at, updated_at,
    contractPeriods:organisation_contract_periods (
      id, starts_on, ends_on, learner_seat_allowance, created_at, updated_at,
      activations:organisation_seat_activations (organisation_user_id)
    ),
    cohorts:organisation_cohorts (id, name, starts_on, ends_on, status),
    groups:organisation_groups (
      id, name, status, provisioning_method, source_external_id
    )
  `,
    )
    .eq('id', organisationId)
    .single();
}

export type OrganisationDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationDetailQuery>
>;

export function buildOrganisationMembershipsCountQuery(
  client: DatabaseClient,
  organisationId: string,
  filters: {
    role?: OrganisationRole;
    status?: OrganisationUserStatus;
  } = {},
) {
  let query = client
    .from('organisation_users')
    .select('id', { count: 'exact', head: true })
    .eq('organisation_id', organisationId);

  if (filters.role) query = query.eq('role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);

  return query;
}

export function buildOrganisationUserProvisionsCountQuery(
  client: DatabaseClient,
  organisationId: string,
  filters: {
    role?: OrganisationRole;
    status?: ProvisioningStatus;
  } = {},
) {
  let query = client
    .from('organisation_user_provisions')
    .select('id', { count: 'exact', head: true })
    .eq('organisation_id', organisationId);

  if (filters.role) query = query.eq('provisioned_role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);

  return query;
}

export function buildOrganisationMembershipsQuery(
  client: DatabaseClient,
  organisationId: string,
  filters: {
    role?: OrganisationRole;
    status?: OrganisationUserStatus;
  } = {},
) {
  let query = client
    .from('organisation_users')
    .select('id, user_id, role, status, created_at, updated_at')
    .eq('organisation_id', organisationId);

  if (filters.role) query = query.eq('role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);

  return query;
}

export type OrganisationMembershipsQueryResult = QueryData<
  ReturnType<typeof buildOrganisationMembershipsQuery>
>;

export function buildOrganisationUserProvisionsQuery(
  client: DatabaseClient,
  organisationId: string,
  filters: {
    role?: OrganisationRole;
    status?: ProvisioningStatus;
  } = {},
) {
  let query = client
    .from('organisation_user_provisions')
    .select(
      `
      id,
      organisation_user_id,
      provisioning_method,
      source_external_id,
      provisioned_user_name,
      provisioned_display_name,
      provisioned_given_name,
      provisioned_family_name,
      provisioned_role,
      status,
      last_synchronized_at,
      linked_at,
      revoked_at,
      created_at,
      updated_at,
      organisation:organisations (id, name, slug, status),
      cohort:organisation_cohorts (id, name, starts_on, ends_on, status),
      groupLinks:organisation_provisioned_group_users (
        group:organisation_groups (
          id, name, status, provisioning_method, source_external_id
        )
      )
    `,
    )
    .eq('organisation_id', organisationId);

  if (filters.role) query = query.eq('provisioned_role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);

  return query;
}

export type OrganisationUserProvisionsQueryResult = QueryData<
  ReturnType<typeof buildOrganisationUserProvisionsQuery>
>;
