import { createOrganisationsService } from '@hektor/services/organisations';
import { previewOrganisationProvisionImportContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  previewOrganisationProvisionImportContract,
  async ({ params, body }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).previewOrganisationProvisionImport(params, body),
);
