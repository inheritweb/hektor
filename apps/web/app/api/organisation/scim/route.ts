import { createScimConfigurationService } from '@hektor/services/scim';
import {
  getTenantOrganisationScimConfigurationContract,
  updateTenantOrganisationScimConfigurationContract,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getTenantOrganisationScimConfigurationContract,
  async (_input, { tenant }) =>
    createScimConfigurationService(
      createAdminSupabaseClient(),
    ).getConfiguration(tenant.organisationId),
);

export const PATCH = registerEndpoint(
  updateTenantOrganisationScimConfigurationContract,
  async ({ body }, { tenant }) =>
    createScimConfigurationService(
      createAdminSupabaseClient(),
    ).updateConfiguration(tenant.organisationId, body.defaultRole),
);
