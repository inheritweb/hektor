import { createOrganisationsService } from '@hektor/services/organisations';
import {
  createOrganisationGroupContract,
  listOrganisationGroupsContract,
} from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listOrganisationGroupsContract,
  async ({ params, query }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationGroups(params, query),
);

export const POST = registerEndpoint(
  createOrganisationGroupContract,
  async ({ body, params }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).createOrganisationGroup(params, body),
);
