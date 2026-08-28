import type { User } from '@supabase/supabase-js';

export function isAuthUserSuspended(user: Pick<User, 'banned_until'>) {
  return (
    Boolean(user.banned_until) &&
    new Date(user.banned_until!).getTime() > Date.now()
  );
}
