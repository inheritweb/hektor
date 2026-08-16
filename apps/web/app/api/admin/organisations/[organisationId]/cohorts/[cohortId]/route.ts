import { createOrganisationsService } from '@hektor/services/organisations';
import { getOrganisationCohortContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getOrganisationCohortContract,
  async ({ params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).getOrganisationCohort(params),
);
