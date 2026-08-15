import type { User } from '@supabase/supabase-js';

import { googleIdentityConfig } from '@hektor/config/identity';
import { PlatformRole } from '@hektor/types';

export function platformAdminEmails(value: string) {
  return new Set(
    value
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isPlatformAdmin(user: User) {
  return user.app_metadata.role === PlatformRole.Admin;
}

export function canBootstrapPlatformAdmin(user: User, emails: Set<string>) {
  const hasGoogleIdentity = user.identities?.some(
    (identity) => identity.provider === googleIdentityConfig.provider,
  );

  return Boolean(
    hasGoogleIdentity && user.email && emails.has(user.email.toLowerCase()),
  );
}
