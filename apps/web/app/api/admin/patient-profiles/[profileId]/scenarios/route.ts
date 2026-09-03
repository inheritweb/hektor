import { createPatientScenariosService } from '@hektor/services/patient-scenarios';
import { listAdminPatientScenariosContract } from '@hektor/types/contracts/patient-scenarios';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listAdminPatientScenariosContract,
  async ({ params, query }) => ({
    data: await createPatientScenariosService(
      createAdminSupabaseClient(),
    ).listAdminPatientScenarios(params.profileId, query.versionId),
  }),
);
