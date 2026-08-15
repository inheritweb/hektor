import type { Database } from '@hektor/types/database';
import type { QueryData, SupabaseClient } from '@supabase/supabase-js';

export type DatabaseClient = SupabaseClient<Database>;

export function buildCurrentUserOrganisationsQuery(
  client: DatabaseClient,
  userId: string,
) {
  return client
    .from('organisation_users')
    .select(
      `
        id, user_name, role, status, scim_status,
        organisation:organisations!inner (id, name, slug, status)
      `,
    )
    .eq('user_id', userId)
    .order('created_at');
}

export type CurrentUserOrganisationsQueryResult = QueryData<
  ReturnType<typeof buildCurrentUserOrganisationsQuery>
>;
