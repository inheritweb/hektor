import { createOrganisationsService } from '@hektor/services/organisations';
import { listOrganisationMembershipCandidatesContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listOrganisationMembershipCandidatesContract,
  async ({ params, query }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationMembershipCandidates(params, query),
);
