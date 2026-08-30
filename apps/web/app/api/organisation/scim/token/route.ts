import { createScimConfigurationService } from '@hektor/services/scim';
import {
  issueTenantOrganisationScimTokenContract,
  revokeTenantOrganisationScimTokenContract,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  issueTenantOrganisationScimTokenContract,
  async (_input, { tenant }) =>
    createScimConfigurationService(createAdminSupabaseClient()).issueToken(
      tenant.organisationId,
    ),
);

export const DELETE = registerEndpoint(
  revokeTenantOrganisationScimTokenContract,
  async (_input, { tenant }) =>
    createScimConfigurationService(createAdminSupabaseClient()).revokeToken(
      tenant.organisationId,
    ),
);
