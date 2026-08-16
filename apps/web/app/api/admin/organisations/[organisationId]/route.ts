import { createOrganisationsService } from '@hektor/services/organisations';
import { getOrganisationContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getOrganisationContract,
  async ({ params }) =>
    createOrganisationsService(createAdminSupabaseClient()).getOrganisation(
      params,
    ),
);
