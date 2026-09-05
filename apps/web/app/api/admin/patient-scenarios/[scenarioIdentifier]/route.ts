import { createPatientScenariosService } from '@hektor/services/patient-scenarios';
import {
  getAdminPatientScenarioContract,
  updateAdminPatientScenarioDraftContract,
} from '@hektor/types/contracts/patient-scenarios';

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

export const PATCH = registerEndpoint(
  updateAdminPatientScenarioDraftContract,
  async ({ body, params }) => ({
    data: await createPatientScenariosService(
      createAdminSupabaseClient(),
    ).updateAdminPatientScenarioDraft(params.scenarioIdentifier, body),
  }),
);
