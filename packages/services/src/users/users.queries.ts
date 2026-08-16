import type { QueryData } from '@supabase/supabase-js';

import type { DatabaseClient } from '../database';

export function createUsersQueries(client: DatabaseClient) {
  const buildCurrentUserOrganisationsQuery = (userId: string) =>
    client
      .from('organisation_users')
      .select(
        `
        id, role, status,
        organisation:organisations!inner (id, name, slug, status)
      `,
      )
      .eq('user_id', userId)
      .order('created_at');

  const buildUserMembershipCountsQuery = (userIds: string[]) =>
    client.from('organisation_users').select('user_id').in('user_id', userIds);

  return {
    buildCurrentUserOrganisationsQuery,
    buildUserMembershipCountsQuery,
  };
}

export type CurrentUserOrganisationsQueryResult = QueryData<
  ReturnType<
    ReturnType<typeof createUsersQueries>['buildCurrentUserOrganisationsQuery']
  >
>;

export type UserMembershipCountsQueryResult = QueryData<
  ReturnType<
    ReturnType<typeof createUsersQueries>['buildUserMembershipCountsQuery']
  >
>;
