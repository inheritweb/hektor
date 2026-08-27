import {
  createOrganisationInvitationsService,
  createOrganisationsService,
} from '@hektor/services/organisations';
import { commitOrganisationProvisionImportContract } from '@hektor/types/contracts/organisations';

import { env } from '@/env';
import { registerEndpoint } from '@/lib/api/route-handler';
import { createMessageSender } from '@/lib/messaging';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  commitOrganisationProvisionImportContract,
  async ({ params, body }) => {
    const client = createAdminSupabaseClient();
    const invitations = createOrganisationInvitationsService({
      client,
      messageSender: createMessageSender(),
      webBaseUrl: env.PUBLIC_BASE_URL,
    });
    return createOrganisationsService(client).commitOrganisationProvisionImport(
      params,
      body,
      (provisionId) =>
        invitations.sendInvitation({
          organisationId: params.organisationId,
          provisionId,
        }),
    );
  },
);
