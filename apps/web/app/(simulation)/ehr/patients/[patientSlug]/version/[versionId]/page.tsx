import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { PatientEhrPreviewScreen } from '../../PatientEhrPreviewScreen';

export default async function VersionedPatientEhrPreviewRoute({
  params,
}: {
  params: Promise<{ patientSlug: string; versionId: string }>;
}) {
  await requirePlatformAdmin();
  const { patientSlug, versionId } = await params;

  return (
    <PatientEhrPreviewScreen patientSlug={patientSlug} versionId={versionId} />
  );
}
