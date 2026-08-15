import type { QueryData } from '@supabase/supabase-js';

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
    cohorts (id, name, starts_on, ends_on, status)
  `,
    )
    .eq('id', organisationId)
    .single();
}

export type OrganisationDetailQueryResult = QueryData<
  ReturnType<typeof buildOrganisationDetailQuery>
>;
