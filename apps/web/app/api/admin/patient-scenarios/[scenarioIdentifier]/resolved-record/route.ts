import { createPatientScenariosService } from '@hektor/services/patient-scenarios';
import { getAdminPatientScenarioResolvedRecordContract } from '@hektor/types/contracts/patient-scenarios';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getAdminPatientScenarioResolvedRecordContract,
  async ({ params, query }) => ({
    data: await createPatientScenariosService(
      createAdminSupabaseClient(),
    ).getAdminPatientScenarioResolvedRecord(
      params.scenarioIdentifier,
      query.stepId,
    ),
  }),
);
