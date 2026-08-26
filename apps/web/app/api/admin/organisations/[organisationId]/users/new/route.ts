import { createOrganisationsService } from '@hektor/services/organisations';
import { createOrganisationUserContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  createOrganisationUserContract,
  async ({ body, params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).createOrganisationUser(params, body),
);
