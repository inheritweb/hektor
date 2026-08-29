import { createOrganisationInvitationsService } from '@hektor/services/organisations';
import { sendTenantOrganisationProvisionInvitationContract } from '@hektor/types/contracts/organisations';

import { env } from '@/env';
import { registerEndpoint } from '@/lib/api/route-handler';
import { createMessageSender } from '@/lib/messaging';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  sendTenantOrganisationProvisionInvitationContract,
  async ({ params }, { tenant }) =>
    createOrganisationInvitationsService({
      client: createAdminSupabaseClient(),
      messageSender: createMessageSender(),
      webBaseUrl: env.PUBLIC_BASE_URL,
    }).sendInvitation({
      organisationId: tenant.organisationId,
      provisionId: params.provisionId,
    }),
);
