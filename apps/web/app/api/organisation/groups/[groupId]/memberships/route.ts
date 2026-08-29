import { createOrganisationsService } from '@hektor/services/organisations';
import { updateTenantOrganisationGroupMembershipContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  updateTenantOrganisationGroupMembershipContract,
  async ({ body, params }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).updateOrganisationGroupMembership(
      { organisationId: tenant.organisationId, groupId: params.groupId },
      body,
    ),
);
