import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminPatientProfileDetailScreen } from './AdminPatientProfileDetailScreen';

export default async function AdminPatientProfileDetailRoute({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  await requirePlatformAdmin();
  const { profileId } = await params;
  return <AdminPatientProfileDetailScreen profileId={profileId} />;
}
