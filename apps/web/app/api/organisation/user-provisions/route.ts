import {
  createOrganisationInvitationsService,
  createOrganisationsService,
} from '@hektor/services/organisations';
import {
  createTenantOrganisationUserProvisionContract,
  listTenantOrganisationUserProvisionsContract,
} from '@hektor/types/contracts/organisations';

import { env } from '@/env';
import { registerEndpoint } from '@/lib/api/route-handler';
import { createMessageSender } from '@/lib/messaging';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(
  listTenantOrganisationUserProvisionsContract,
  async ({ query }, { tenant }) =>
    createOrganisationsService(
      createAdminSupabaseClient(),
    ).listOrganisationUserProvisions(
      { organisationId: tenant.organisationId },
      query,
    ),
);

export const POST = registerEndpoint(
  createTenantOrganisationUserProvisionContract,
  async ({ body }, { tenant }) => {
    const { sendInvitation, ...provision } = body;
    const client = createAdminSupabaseClient();
    const invitations = createOrganisationInvitationsService({
      client,
      messageSender: createMessageSender(),
      webBaseUrl: env.PUBLIC_BASE_URL,
    });
    await createOrganisationsService(client).commitOrganisationProvisionImport(
      { organisationId: tenant.organisationId },
      {
        rows: [{ ...provision, rowNumber: 1 }],
        sendInvitations: sendInvitation,
      },
      (provisionId) =>
        invitations.sendInvitation({
          organisationId: tenant.organisationId,
          provisionId,
        }),
    );

    return { data: { accepted: true as const } };
  },
);
