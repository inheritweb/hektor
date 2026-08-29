import { createOrganisationsService } from '@hektor/services/organisations';
import {
  getTenantOrganisationMembershipContract,
  updateTenantOrganisationMembershipContract,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getTenantOrganisationMembershipContract,
  async ({ params }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).getOrganisationMembership({
      organisationId: tenant.organisationId,
      membershipId: params.membershipId,
    }),
);

export const PATCH = registerEndpoint(
  updateTenantOrganisationMembershipContract,
  async ({ body, params }, { tenant, user }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).updateOrganisationMembershipAsOrganisationAdmin(
      {
        organisationId: tenant.organisationId,
        membershipId: params.membershipId,
      },
      body,
      user.id,
    ),
);
