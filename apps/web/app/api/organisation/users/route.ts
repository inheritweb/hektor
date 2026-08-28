import { createOrganisationsService } from '@hektor/services/organisations';
import { listTenantOrganisationUsersContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listTenantOrganisationUsersContract,
  async ({ query }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationUsers({ organisationId: tenant.organisationId }, query),
);
