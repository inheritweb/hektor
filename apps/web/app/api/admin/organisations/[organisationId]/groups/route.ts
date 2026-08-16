import { createOrganisationsService } from '@hektor/services/organisations';
import { listOrganisationGroupsContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listOrganisationGroupsContract,
  async ({ params, query }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationGroups(params, query),
);
