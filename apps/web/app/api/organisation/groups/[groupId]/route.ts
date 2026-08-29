import { createOrganisationsService } from '@hektor/services/organisations';
import {
  getTenantOrganisationGroupContract,
  updateTenantOrganisationGroupContract,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getTenantOrganisationGroupContract,
  async ({ params }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).getOrganisationGroup({
      organisationId: tenant.organisationId,
      groupId: params.groupId,
    }),
);

export const PATCH = registerEndpoint(
  updateTenantOrganisationGroupContract,
  async ({ body, params }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).updateOrganisationGroup(
      { organisationId: tenant.organisationId, groupId: params.groupId },
      body,
    ),
);
