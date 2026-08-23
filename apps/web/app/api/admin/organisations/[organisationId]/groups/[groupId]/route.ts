import { createOrganisationsService } from '@hektor/services/organisations';
import {
  getOrganisationGroupContract,
  updateOrganisationGroupContract,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getOrganisationGroupContract,
  async ({ params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).getOrganisationGroup(params),
);

export const PATCH = registerEndpoint(
  updateOrganisationGroupContract,
  async ({ body, params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).updateOrganisationGroup(params, body),
);
