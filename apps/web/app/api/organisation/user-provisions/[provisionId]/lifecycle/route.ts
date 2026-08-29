import { createOrganisationsService } from '@hektor/services/organisations';
import { transitionTenantOrganisationUserProvisionContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const PATCH = registerEndpoint(
  transitionTenantOrganisationUserProvisionContract,
  async ({ body, params }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).transitionOrganisationUserProvision({
      action: body.action,
      expectedStatus: body.expectedStatus,
      organisationId: tenant.organisationId,
      provisionId: params.provisionId,
    }),
);
