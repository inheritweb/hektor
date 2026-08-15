import { NextResponse, type NextRequest } from 'next/server';

import { googleIdentityConfig } from '@hektor/config/identity';

import { env } from '../../../env';
import { bootstrapPlatformAdmin } from '../../../lib/auth/platform-admin';
import { resolvePostLoginPath } from '../../../lib/auth/redirects';
import { createClient } from '../../../lib/supabase/server';

function loginError(reason: string) {
  const url = new URL(googleIdentityConfig.errorPath, env.PUBLIC_BASE_URL);
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = resolvePostLoginPath(request.nextUrl.searchParams.get('next'));

  if (!code) return loginError('missing-code');

  const client = await createClient();
  const { error } = await client.auth.exchangeCodeForSession(code);

  if (error) return loginError('code-exchange-failed');

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return loginError('missing-user');

  await bootstrapPlatformAdmin(user);

  const { error: refreshError } = await client.auth.refreshSession();

  if (refreshError) return loginError('session-refresh-failed');

  return NextResponse.redirect(new URL(next, env.PUBLIC_BASE_URL));
}
