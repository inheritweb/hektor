import { createStatisticsService } from '@hektor/services/statistics';
import { getOrganisationStatisticsContract } from '@hektor/types/contracts/statistics';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getOrganisationStatisticsContract,
  async (_, { tenant }) => ({
    data: await createStatisticsService(
      createAdminSupabaseClient(),
    ).getOrganisationStatistics(tenant.organisationId),
  }),
);
