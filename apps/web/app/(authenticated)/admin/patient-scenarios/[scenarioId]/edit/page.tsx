import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminPatientScenarioEditScreen } from './AdminPatientScenarioEditScreen';

export default async function AdminPatientScenarioEditRoute({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  await requirePlatformAdmin();
  const { scenarioId } = await params;
  return <AdminPatientScenarioEditScreen scenarioId={scenarioId} />;
}
