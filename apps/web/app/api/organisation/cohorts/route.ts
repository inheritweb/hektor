import { createOrganisationsService } from '@hektor/services/organisations';
import {
  createTenantOrganisationCohortContract,
  listTenantOrganisationCohortsContract,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listTenantOrganisationCohortsContract,
  async ({ query }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationCohorts({ organisationId: tenant.organisationId }, query),
);

export const POST = registerEndpoint(
  createTenantOrganisationCohortContract,
  async ({ body }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).createOrganisationCohort({ organisationId: tenant.organisationId }, body),
);
