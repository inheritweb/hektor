import { createOrganisationsService } from '@hektor/services/organisations';
import { getTenantOrganisationCohortContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getTenantOrganisationCohortContract,
  async ({ params }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).getOrganisationCohort({
      organisationId: tenant.organisationId,
      cohortId: params.cohortId,
    }),
);
