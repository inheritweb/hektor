import { createOrganisationInvitationsService } from '@hektor/services/organisations';
import { sendOrganisationProvisionInvitationContract } from '@hektor/types/contracts/organisations';

import { env } from '@/env';
import { registerEndpoint } from '@/lib/api/route-handler';
import { createMessageSender } from '@/lib/messaging';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  sendOrganisationProvisionInvitationContract,
  async ({ params }) =>
    createOrganisationInvitationsService({
      client: createAdminSupabaseClient(),
      messageSender: createMessageSender(),
      webBaseUrl: env.PUBLIC_BASE_URL,
    }).sendInvitation(params),
);
