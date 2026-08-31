import { AdminPatientProfileDetailScreen } from '../../AdminPatientProfileDetailScreen';

export default async function AdminPatientProfileVersionRoute({
  params,
}: {
  params: Promise<{ profileId: string; versionId: string }>;
}) {
  const { profileId, versionId } = await params;
  return (
    <AdminPatientProfileDetailScreen
      profileId={profileId}
      versionId={versionId}
    />
  );
}
