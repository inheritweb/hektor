import { createOrganisationsService } from '@hektor/services/organisations';
import {
  getTenantOrganisationCohortContract,
  updateTenantOrganisationCohortContract,
} from '@hektor/types/contracts/organisations';

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

export const PATCH = registerEndpoint(
  updateTenantOrganisationCohortContract,
  async ({ params, body }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).updateOrganisationCohort(
      { organisationId: tenant.organisationId, cohortId: params.cohortId },
      body,
    ),
);
