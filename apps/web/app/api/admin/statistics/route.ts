import { createStatisticsService } from '@hektor/services/statistics';
import { getPlatformStatisticsContract } from '@hektor/types/contracts/statistics';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getPlatformStatisticsContract,
  async () => ({
    data: await createStatisticsService(
      createAdminSupabaseClient(),
    ).getPlatformStatistics(),
  }),
);
