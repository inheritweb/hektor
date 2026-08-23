import { NextResponse, type NextRequest } from 'next/server';
import {
  createSimulatorService,
  simulatorScenarios,
} from '@hektor/services/simulator';
import { createOrganisationInvitationsService } from '@hektor/services/organisations';

import { env } from '@/env';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function redirectUrl(destination: 'simulator' | 'web', path: string) {
  return new URL(
    path,
    destination === 'simulator' ? env.SIMULATOR_BASE_URL : env.PUBLIC_BASE_URL,
  );
}

async function service() {
  const adminClient = createAdminSupabaseClient();

  return createSimulatorService({
    adminClient,
    invitationLauncher: async ({ organisationId, provisionId }) => {
      let invitationUrl: URL | undefined;

      await createOrganisationInvitationsService({
        client: adminClient,
        messageSender: {
          send: async (message) => {
            const match = message.text.match(/https?:\/\/\S+/);
            if (match) invitationUrl = new URL(match[0]);
          },
        },
        resendCooldownSeconds: 0,
        webBaseUrl: env.PUBLIC_BASE_URL,
      }).sendInvitation({ organisationId, provisionId });

      if (!invitationUrl) throw new Error('invitation_url_missing');
      return `${invitationUrl.pathname}${invitationUrl.search}`;
    },
    sessionClient: await createServerSupabaseClient(),
  });
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const scenarioId = (await request.formData()).get('scenarioId');
  const scenario = simulatorScenarios.find(
    (candidate) => candidate.id === scenarioId,
  );

  if (!scenario) {
    return NextResponse.redirect(
      redirectUrl('simulator', '/?error=invalid-scenario'),
      303,
    );
  }

  try {
    const result = await (
      await service()
    ).startScenario({
      identityEmail: scenario.email,
      institutionName: scenario.institutionName,
      mode: scenario.mode,
    });
    return NextResponse.redirect(
      redirectUrl(result.destination, result.path),
      303,
    );
  } catch {
    return NextResponse.redirect(
      redirectUrl('simulator', '/?error=session-setup-failed'),
      303,
    );
  }
}
