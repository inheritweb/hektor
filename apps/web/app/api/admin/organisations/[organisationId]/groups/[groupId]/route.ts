import { createOrganisationsService } from '@hektor/services/organisations';
import { getOrganisationGroupContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getOrganisationGroupContract,
  async ({ params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).getOrganisationGroup(params),
);
