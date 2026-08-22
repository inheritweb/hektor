import { createOrganisationsService } from '@hektor/services/organisations';
import { transitionOrganisationUserProvisionContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const PATCH = registerEndpoint(
  transitionOrganisationUserProvisionContract,
  async ({ params, body }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).transitionOrganisationUserProvision({
      provisionId: params.provisionId,
      expectedStatus: body.expectedStatus,
      action: body.action,
      organisationUserId: body.organisationUserId,
    }),
);
