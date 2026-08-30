import type { Database } from '@hektor/types/database';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { env } from '../../env';

export async function createServerSupabaseClient({
  allowCookieWrites = false,
}: { allowCookieWrites?: boolean } = {}) {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          if (!allowCookieWrites) return;
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}
