import { createOrganisationsService } from '@hektor/services/organisations';
import {
  getOrganisationMembershipContract,
  updateOrganisationMembershipContract,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getOrganisationMembershipContract,
  async ({ params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).getOrganisationMembership(params),
);

export const PATCH = registerEndpoint(
  updateOrganisationMembershipContract,
  async ({ body, params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).updateOrganisationMembership(params, body),
);
