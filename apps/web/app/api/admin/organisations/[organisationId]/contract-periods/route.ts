import { createOrganisationsService } from '@hektor/services/organisations';
import { listOrganisationContractPeriodsContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listOrganisationContractPeriodsContract,
  async ({ params, query }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationContractPeriods(params, query),
);
