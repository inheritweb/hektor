import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminPatientProfileEditScreen } from './AdminPatientProfileEditScreen';

export default async function AdminPatientProfileEditRoute({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  await requirePlatformAdmin();
  const { profileId } = await params;
  return <AdminPatientProfileEditScreen profileId={profileId} />;
}
