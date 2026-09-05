import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminPatientScenarioCreateScreen } from './AdminPatientScenarioCreateScreen';

export default async function AdminPatientScenarioCreateRoute({
  params,
}: {
  params: Promise<{ profileId: string; versionId: string }>;
}) {
  await requirePlatformAdmin();
  const { profileId, versionId } = await params;
  return (
    <AdminPatientScenarioCreateScreen
      profileId={profileId}
      versionId={versionId}
    />
  );
}
