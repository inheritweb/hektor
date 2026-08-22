import { createOrganisationsService } from '@hektor/services/organisations';
import { getProvisionAcceptanceContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  getProvisionAcceptanceContract,
  async ({ params }, { user }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).getProvisionAcceptance({
      provisionId: params.provisionId,
      userId: user.id,
      email: user.email,
      emailVerified: Boolean(user.email_confirmed_at),
    }),
);
