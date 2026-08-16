import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminOrganisationUsersScreen } from './AdminOrganisationUsersScreen';

export default async function AdminOrganisationUsersRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  await requirePlatformAdmin();
  const { organisationId } = await params;
  return <AdminOrganisationUsersScreen organisationId={organisationId} />;
}
