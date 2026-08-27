import { createOrganisationInvitationsService } from '@hektor/services/organisations';
import { sendOrganisationProvisionInvitationsContract } from '@hektor/types/contracts/organisations';

import { env } from '@/env';
import { registerEndpoint } from '@/lib/api/route-handler';
import { createMessageSender } from '@/lib/messaging';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  sendOrganisationProvisionInvitationsContract,
  async ({ params, body }) =>
    createOrganisationInvitationsService({
      client: createAdminSupabaseClient(),
      messageSender: createMessageSender(),
      webBaseUrl: env.PUBLIC_BASE_URL,
    }).sendInvitations(params, body),
);
