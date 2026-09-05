import { createPatientScenariosService } from '@hektor/services/patient-scenarios';
import { listAdminPatientScenarioCatalogueContract } from '@hektor/types/contracts/patient-scenarios';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listAdminPatientScenarioCatalogueContract,
  async () => ({
    data: await createPatientScenariosService(
      createAdminSupabaseClient(),
    ).listAdminPatientScenarioCatalogue(),
  }),
);
