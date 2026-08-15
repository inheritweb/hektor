import type { ReactNode } from 'react';

import { PlatformRole } from '@hektor/types';

import { requireAuthenticated } from '../../lib/auth/platform-admin';

import { AuthenticatedShell } from './AuthenticatedShell';

export default async function AuthenticatedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await requireAuthenticated();
  const displayName =
    typeof user.user_metadata.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.user_metadata.name === 'string'
        ? user.user_metadata.name
        : (user.email ?? 'Your account');

  return (
    <AuthenticatedShell
      fallbackUser={{
        displayName,
        email: user.email,
        platformRole:
          user.app_metadata.role === PlatformRole.Admin
            ? PlatformRole.Admin
            : undefined,
      }}
    >
      {children}
    </AuthenticatedShell>
  );
}
