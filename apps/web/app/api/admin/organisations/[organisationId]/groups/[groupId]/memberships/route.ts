import { createOrganisationsService } from '@hektor/services/organisations';
import { updateOrganisationGroupMembershipContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  updateOrganisationGroupMembershipContract,
  async ({ body, params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).updateOrganisationGroupMembership(params, body),
);
