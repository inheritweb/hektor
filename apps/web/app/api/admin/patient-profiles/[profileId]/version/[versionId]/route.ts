import { createPatientProfilesService } from '@hektor/services/patient-profiles';
import { getAdminPatientProfileVersionContract } from '@hektor/types/contracts/patient-profiles';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getAdminPatientProfileVersionContract,
  async ({ params }) => ({
    data: await createPatientProfilesService(
      createAdminSupabaseClient(),
    ).getAdminPatientProfile(params.profileId, params.versionId),
  }),
);
