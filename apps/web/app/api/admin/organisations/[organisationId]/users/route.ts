import { createOrganisationsService } from '@hektor/services/organisations';
import { listOrganisationUsersContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listOrganisationUsersContract,
  async ({ params, query }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationUsers(params, query),
);
