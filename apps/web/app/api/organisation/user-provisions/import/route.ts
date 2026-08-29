import {
  createOrganisationInvitationsService,
  createOrganisationsService,
} from '@hektor/services/organisations';
import { commitTenantOrganisationProvisionImportContract } from '@hektor/types/contracts/organisations';

import { env } from '@/env';
import { registerEndpoint } from '@/lib/api/route-handler';
import { createMessageSender } from '@/lib/messaging';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const POST = registerEndpoint(
  commitTenantOrganisationProvisionImportContract,
  async ({ body }, { tenant }) => {
    const client = createAdminSupabaseClient();
    const invitations = createOrganisationInvitationsService({
      client,
      messageSender: createMessageSender(),
      webBaseUrl: env.PUBLIC_BASE_URL,
    });
    const result = await createOrganisationsService(
      client,
    ).commitOrganisationProvisionImport(
      { organisationId: tenant.organisationId },
      body,
      (provisionId) =>
        invitations.sendInvitation({
          organisationId: tenant.organisationId,
          provisionId,
        }),
    );

    return {
      data: {
        processed: result.data.created + result.data.linked,
        unchanged: result.data.unchanged,
      },
    };
  },
);
