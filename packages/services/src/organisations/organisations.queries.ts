import type { QueryData } from '@supabase/supabase-js';

import {
  type GroupStatus,
  type OrganisationRole,
  type OrganisationUserStatus,
  type ProvisioningMethod,
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
      activations:organisation_seat_activations (organisation_user_id, released_at)
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

export function buildOrganisationContractPeriodsQuery(
  client: DatabaseClient,
  organisationId: string,
  options: {
    page: number;
    pageSize: number;
    order: 'startsOn' | 'endsOn';
    dir: 'asc' | 'desc';
  },
) {
  const first = (options.page - 1) * options.pageSize;
  const order = options.order === 'endsOn' ? 'ends_on' : 'starts_on';

  return client
    .from('organisation_contract_periods')
    .select(
      `
      id, starts_on, ends_on, learner_seat_allowance, created_at, updated_at,
      activations:organisation_seat_activations (organisation_user_id, released_at)
    `,
      { count: 'exact' },
    )
    .eq('organisation_id', organisationId)
    .order(order, { ascending: options.dir === 'asc' })
    .range(first, first + options.pageSize - 1);
}

export type OrganisationContractPeriodsQueryResult = QueryData<
  ReturnType<typeof buildOrganisationContractPeriodsQuery>
>;

export function buildOrganisationCohortsQuery(
  client: DatabaseClient,
  organisationId: string,
  options: {
    page: number;
    pageSize: number;
    order: 'name' | 'startsOn' | 'endsOn';
    dir: 'asc' | 'desc';
    status?: GroupStatus;
  },
) {
  const first = (options.page - 1) * options.pageSize;
  const order =
    options.order === 'endsOn'
      ? 'ends_on'
      : options.order === 'startsOn'
        ? 'starts_on'
        : 'name';
  let query = client
    .from('organisation_cohorts')
    .select('id, name, starts_on, ends_on, status', { count: 'exact' })
    .eq('organisation_id', organisationId)
    .order(order, { ascending: options.dir === 'asc' })
    .range(first, first + options.pageSize - 1);

  if (options.status) query = query.eq('status', options.status);
  return query;
}

export type OrganisationCohortsQueryResult = QueryData<
  ReturnType<typeof buildOrganisationCohortsQuery>
>;

export function buildOrganisationCohortDetailQuery(
  client: DatabaseClient,
  organisationId: string,
  cohortId: string,
) {
  return client
    .from('organisation_cohorts')
    .select(
      `
      id, name, starts_on, ends_on, status, created_at, updated_at,
      organisation:organisations (id, name, slug, status),
      groups:organisation_groups (
        id, name, status, provisioning_method, source_external_id
      ),
      memberships:organisation_users (id, user_id, role, status)
    `,
    )
    .eq('organisation_id', organisationId)
    .eq('id', cohortId)
    .single();
}

export type OrganisationCohortDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationCohortDetailQuery>
>;

export function buildOrganisationGroupsQuery(
  client: DatabaseClient,
  organisationId: string,
  options: {
    page: number;
    pageSize: number;
    order: 'name' | 'createdAt';
    dir: 'asc' | 'desc';
    status?: GroupStatus;
    provisioningMethod?: ProvisioningMethod;
  },
) {
  const first = (options.page - 1) * options.pageSize;
  const order = options.order === 'createdAt' ? 'created_at' : 'name';
  let query = client
    .from('organisation_groups')
    .select('id, name, status, provisioning_method, source_external_id', {
      count: 'exact',
    })
    .eq('organisation_id', organisationId)
    .order(order, { ascending: options.dir === 'asc' })
    .range(first, first + options.pageSize - 1);

  if (options.status) query = query.eq('status', options.status);
  if (options.provisioningMethod) {
    query = query.eq('provisioning_method', options.provisioningMethod);
  }
  return query;
}

export type OrganisationGroupsQueryResult = QueryData<
  ReturnType<typeof buildOrganisationGroupsQuery>
>;

export function buildOrganisationGroupDetailQuery(
  client: DatabaseClient,
  organisationId: string,
  groupId: string,
) {
  return client
    .from('organisation_groups')
    .select(
      `
      id, name, status, provisioning_method, source_external_id,
      last_synchronized_at, source_deleted_at, created_at, updated_at,
      organisation:organisations (id, name, slug, status),
      cohort:organisation_cohorts (id, name, starts_on, ends_on, status),
      userLinks:organisation_group_users (
        membership:organisation_users (id, user_id, role, status)
      ),
      provisionLinks:organisation_provisioned_group_users (
        provision:organisation_user_provisions (
          id, provisioning_method, provisioned_user_name,
          provisioned_display_name, provisioned_role, status
        )
      )
    `,
    )
    .eq('organisation_id', organisationId)
    .eq('id', groupId)
    .single();
}

export type OrganisationGroupDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationGroupDetailQuery>
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

export function buildOrganisationUserProvisionDetailQuery(
  client: DatabaseClient,
  organisationId: string,
  provisionId: string,
) {
  return client
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
      membership:organisation_users (id, user_id, role, status),
      groupLinks:organisation_provisioned_group_users (
        group:organisation_groups (
          id, name, status, provisioning_method, source_external_id
        )
      )
    `,
    )
    .eq('organisation_id', organisationId)
    .eq('id', provisionId)
    .single();
}

export type OrganisationUserProvisionDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationUserProvisionDetailQuery>
>;

export function buildOrganisationMembershipForUserQuery(
  client: DatabaseClient,
  organisationId: string,
  userId: string,
) {
  return client
    .from('organisation_users')
    .select('id, user_id, role, status')
    .eq('organisation_id', organisationId)
    .eq('user_id', userId)
    .maybeSingle();
}

export function transitionOrganisationUserProvisionQuery(
  client: DatabaseClient,
  options: {
    provisionId: string;
    expectedStatus: ProvisioningStatus;
    action: string;
    organisationUserId?: string;
  },
) {
  return client.rpc('transition_organisation_user_provision', {
    target_provision_id: options.provisionId,
    expected_status: options.expectedStatus,
    lifecycle_action: options.action,
    ...(options.organisationUserId
      ? { target_organisation_user_id: options.organisationUserId }
      : {}),
  });
}

export function buildProvisionAcceptanceQuery(
  client: DatabaseClient,
  provisionId: string,
) {
  return client
    .from('organisation_user_provisions')
    .select(
      `
      id, organisation_user_id, provisioning_method, source_external_id,
      provisioned_user_name, provisioned_display_name, provisioned_given_name,
      provisioned_family_name, provisioned_role, status, last_synchronized_at,
      linked_at, revoked_at, created_at, updated_at,
      organisation:organisations (id, name, slug, status),
      cohort:organisation_cohorts (id, name, starts_on, ends_on, status),
      membership:organisation_users (id, user_id, role, status),
      groupLinks:organisation_provisioned_group_users (
        group:organisation_groups (
          id, name, status, provisioning_method, source_external_id
        )
      )
    `,
    )
    .eq('id', provisionId)
    .single();
}

export function acceptOrganisationUserProvisionQuery(
  client: DatabaseClient,
  provisionId: string,
  userId: string,
) {
  return client.rpc('accept_organisation_user_provision', {
    target_provision_id: provisionId,
    expected_status: ProvisioningStatus.Pending,
    target_user_id: userId,
  });
}
