import { createOrganisationsService } from '@hektor/services/organisations';
import {
  getOrganisationContractPeriodContract,
  updateOrganisationContractPeriodContract,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getOrganisationContractPeriodContract,
  async ({ params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).getOrganisationContractPeriod(params),
);

export const PATCH = registerEndpoint(
  updateOrganisationContractPeriodContract,
  async ({ params, body }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).updateOrganisationContractPeriod(params, body),
);
