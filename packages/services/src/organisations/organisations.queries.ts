import type { QueryData } from '@supabase/supabase-js';

import type { OrganisationRole, OrganisationUserStatus } from '@hektor/types';

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
    cohorts (id, name, starts_on, ends_on, status),
    groups (id, name, status)
  `,
    )
    .eq('id', organisationId)
    .single();
}

export function buildOrganisationUsersCountQuery(
  client: DatabaseClient,
  organisationId: string,
  filters: {
    linked?: boolean;
    role?: OrganisationRole;
    status?: OrganisationUserStatus;
  } = {},
) {
  let query = client
    .from('organisation_users')
    .select('id', { count: 'exact', head: true })
    .eq('organisation_id', organisationId);

  if (filters.linked === true) query = query.not('user_id', 'is', null);
  if (filters.linked === false) query = query.is('user_id', null);
  if (filters.role) query = query.eq('role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);

  return query;
}

export type OrganisationDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationDetailQuery>
>;

export function buildOrganisationUsersQuery(
  client: DatabaseClient,
  organisationId: string,
  options: {
    page: number;
    pageSize: number;
    order: 'userName' | 'role';
    dir: 'asc' | 'desc';
  },
) {
  const first = (options.page - 1) * options.pageSize;
  const order = options.order === 'userName' ? 'user_name' : 'role';

  return client
    .from('organisation_users')
    .select('id, user_id, user_name, display_name, role, status, scim_status', {
      count: 'exact',
    })
    .eq('organisation_id', organisationId)
    .order(order, { ascending: options.dir === 'asc' })
    .range(first, first + options.pageSize - 1);
}

export type OrganisationUsersQueryResult = QueryData<
  ReturnType<typeof buildOrganisationUsersQuery>
>;
