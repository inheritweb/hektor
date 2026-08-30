import { createScimConfigurationService } from '@hektor/services/scim';
import { listTenantOrganisationScimGroupMappingsContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listTenantOrganisationScimGroupMappingsContract,
  async ({ query }, { tenant }) =>
    createScimConfigurationService(
      createAdminSupabaseClient(),
    ).listGroupMappings(tenant.organisationId, query),
);
