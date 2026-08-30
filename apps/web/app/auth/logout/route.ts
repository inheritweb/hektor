import { NextResponse } from 'next/server';

import { googleIdentityConfig } from '@hektor/config/identity';

import { env } from '../../../env';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

export async function POST() {
  const client = await createServerSupabaseClient({ allowCookieWrites: true });
  await client.auth.signOut();

  return NextResponse.redirect(
    new URL(googleIdentityConfig.loginPath, env.PUBLIC_BASE_URL),
    { status: 303 },
  );
}
