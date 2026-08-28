import type { ReactNode } from 'react';

import { getUserDisplayName, PlatformRole } from '@hektor/types';

import { requireAuthenticated } from '../../lib/auth/platform-admin';

import { AuthenticatedShell } from './AuthenticatedShell';

export default async function AuthenticatedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await requireAuthenticated();
  const providerName =
    typeof user.user_metadata.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.user_metadata.name === 'string'
        ? user.user_metadata.name
        : undefined;
  const [providerFirstName, ...providerRemainingNames] =
    providerName?.split(/\s+/) ?? [];
  const firstName =
    typeof user.user_metadata.first_name === 'string'
      ? user.user_metadata.first_name
      : providerFirstName;
  const lastName =
    typeof user.user_metadata.last_name === 'string'
      ? user.user_metadata.last_name
      : providerRemainingNames.join(' ') || undefined;
  const displayName = getUserDisplayName({
    firstName,
    lastName,
    email: user.email,
  });

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
