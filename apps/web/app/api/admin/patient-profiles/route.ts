import { createPatientProfilesService } from '@hektor/services/patient-profiles';
import { listAdminPatientProfilesContract } from '@hektor/types/contracts/patient-profiles';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listAdminPatientProfilesContract,
  async () => ({
    data: await createPatientProfilesService(
      createAdminSupabaseClient(),
    ).listAdminPatientProfiles(),
  }),
);
