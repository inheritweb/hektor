import { createOrganisationsService } from '@hektor/services/organisations';
import { listOrganisationCohortsContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listOrganisationCohortsContract,
  async ({ params, query }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationCohorts(params, query),
);
