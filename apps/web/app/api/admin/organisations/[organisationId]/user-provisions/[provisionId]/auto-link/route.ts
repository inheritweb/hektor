import { createOrganisationsService } from '@hektor/services/organisations';
import { autoLinkOrganisationUserProvisionContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  autoLinkOrganisationUserProvisionContract,
  async ({ params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).autoLinkOrganisationUserProvision(params),
);
