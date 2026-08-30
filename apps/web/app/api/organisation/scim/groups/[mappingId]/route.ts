import { createScimConfigurationService } from '@hektor/services/scim';
import { updateTenantOrganisationScimGroupMappingContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const PATCH = registerEndpoint(
  updateTenantOrganisationScimGroupMappingContract,
  async ({ body, params }, { tenant }) =>
    createScimConfigurationService(
      createAdminSupabaseClient(),
    ).updateGroupMapping(tenant.organisationId, params.mappingId, body),
);
