import { createOrganisationsService } from '@hektor/services/organisations';
import {
  createTenantOrganisationGroupContract,
  listTenantOrganisationGroupsContract,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listTenantOrganisationGroupsContract,
  async ({ query }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationGroups({ organisationId: tenant.organisationId }, query),
);

export const POST = registerEndpoint(
  createTenantOrganisationGroupContract,
  async ({ body }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).createOrganisationGroup({ organisationId: tenant.organisationId }, body),
);
