import { createPatientProfilesService } from '@hektor/services/patient-profiles';
import { getAdminPatientProfileContract } from '@hektor/types/contracts/patient-profiles';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getAdminPatientProfileContract,
  async ({ params }) => ({
    data: await createPatientProfilesService(
      createAdminSupabaseClient(),
    ).getAdminPatientProfile(params.profileId),
  }),
);
