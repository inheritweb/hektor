import { createOrganisationsService } from '@hektor/services/organisations';
import { getTenantOrganisationUserProvisionContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getTenantOrganisationUserProvisionContract,
  async ({ params }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).getOrganisationUserProvision({
      organisationId: tenant.organisationId,
      provisionId: params.provisionId,
    }),
);
