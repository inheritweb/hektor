import { createPatientScenariosService } from '@hektor/services/patient-scenarios';
import { getAdminPatientScenarioContract } from '@hektor/types/contracts/patient-scenarios';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getAdminPatientScenarioContract,
  async ({ params }) => ({
    data: await createPatientScenariosService(
      createAdminSupabaseClient(),
    ).getAdminPatientScenario(params.scenarioIdentifier),
  }),
);
