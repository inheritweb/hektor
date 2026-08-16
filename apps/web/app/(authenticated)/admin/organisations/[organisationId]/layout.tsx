import type { ReactNode } from 'react';

import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminOrganisationLayoutScreen } from './AdminOrganisationLayoutScreen';

export default async function AdminOrganisationLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ organisationId: string }>;
}) {
  await requirePlatformAdmin();
  const { organisationId } = await params;

  return (
    <AdminOrganisationLayoutScreen organisationId={organisationId}>
      {children}
    </AdminOrganisationLayoutScreen>
  );
}
