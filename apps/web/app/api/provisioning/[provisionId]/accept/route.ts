import { createOrganisationsService } from '@hektor/services/organisations';
import { acceptOrganisationUserProvisionContract } from '@hektor/types/contracts/organisations';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  acceptOrganisationUserProvisionContract,
  async ({ params }, { user }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).acceptOrganisationUserProvision({
      provisionId: params.provisionId,
      userId: user.id,
      email: user.email,
      emailVerified: Boolean(user.email_confirmed_at),
    }),
);
