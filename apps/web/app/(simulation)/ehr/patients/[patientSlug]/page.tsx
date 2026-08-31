import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { PatientEhrPreviewScreen } from './PatientEhrPreviewScreen';

export default async function PatientEhrPreviewRoute({
  params,
}: {
  params: Promise<{ patientSlug: string }>;
}) {
  await requirePlatformAdmin();
  const { patientSlug } = await params;

  return <PatientEhrPreviewScreen patientSlug={patientSlug} />;
}
