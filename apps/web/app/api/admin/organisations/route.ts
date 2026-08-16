import { createOrganisationsService } from '@hektor/services/organisations';
import { listOrganisationsContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(listOrganisationsContract, ({ query }) =>
  createOrganisationsService(createAdminSupabaseClient()).listOrganisations(
    query,
  ),
);
