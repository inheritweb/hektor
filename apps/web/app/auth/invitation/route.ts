import { NextResponse, type NextRequest } from 'next/server';

import { createOrganisationInvitationsService } from '@hektor/services/organisations';

import { env } from '@/env';
import { establishEmailSession } from '@/lib/auth/establish-email-session';
import { createMessageSender } from '@/lib/messaging';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const provisionId = request.nextUrl.searchParams.get('provisionId');
  const token = request.nextUrl.searchParams.get('token');

  if (!provisionId || !token) return invitationError();

  const adminClient = createAdminSupabaseClient();
  const sessionClient = await createServerSupabaseClient();

  try {
    await createOrganisationInvitationsService({
      client: adminClient,
      messageSender: createMessageSender(),
      webBaseUrl: env.PUBLIC_BASE_URL,
    }).redeemInvitation({
      establishSession: (email) =>
        establishEmailSession(adminClient, sessionClient, email),
      provisionId,
      token,
    });

    return NextResponse.redirect(
      new URL(
        `/provisioning/accept/${encodeURIComponent(provisionId)}`,
        env.PUBLIC_BASE_URL,
      ),
      303,
    );
  } catch {
    return invitationError();
  }
}

function invitationError() {
  return NextResponse.redirect(
    new URL('/auth/invitation/unavailable', env.PUBLIC_BASE_URL),
    303,
  );
}
