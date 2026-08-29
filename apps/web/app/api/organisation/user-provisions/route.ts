import { createOrganisationsService } from '@hektor/services/organisations';
import { listTenantOrganisationUserProvisionsContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listTenantOrganisationUserProvisionsContract,
  async ({ query }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationUserProvisions(
      { organisationId: tenant.organisationId },
      query,
    ),
);
