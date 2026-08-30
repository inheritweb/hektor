import { NextResponse, type NextRequest } from 'next/server';

import { googleIdentityConfig } from '@hektor/config/identity';

import { env } from '../../../env';
import { resolvePostLoginPath } from '../../../lib/auth/redirects';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

export async function GET(request: NextRequest) {
  const next = resolvePostLoginPath(request.nextUrl.searchParams.get('next'));
  const callback = new URL(
    googleIdentityConfig.callbackPath,
    env.PUBLIC_BASE_URL,
  );

  callback.searchParams.set('next', next);

  const client = await createServerSupabaseClient({ allowCookieWrites: true });
  const { data, error } = await client.auth.signInWithOAuth({
    provider: googleIdentityConfig.provider,
    options: { redirectTo: callback.toString() },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      new URL(googleIdentityConfig.errorPath, env.PUBLIC_BASE_URL),
    );
  }

  return NextResponse.redirect(data.url);
}
