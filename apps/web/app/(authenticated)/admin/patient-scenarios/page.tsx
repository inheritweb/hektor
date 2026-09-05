import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminPatientScenariosScreen } from './AdminPatientScenariosScreen';

export default async function AdminPatientScenariosRoute() {
  await requirePlatformAdmin();
  return <AdminPatientScenariosScreen />;
}
