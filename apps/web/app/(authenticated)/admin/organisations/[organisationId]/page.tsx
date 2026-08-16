import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminOrganisationDetailScreen } from './AdminOrganisationDetailScreen';

export default async function AdminOrganisationDetailRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  await requirePlatformAdmin();
  const { organisationId } = await params;
  return <AdminOrganisationDetailScreen organisationId={organisationId} />;
}
