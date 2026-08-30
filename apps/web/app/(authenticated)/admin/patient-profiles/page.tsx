import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminPatientProfilesScreen } from './AdminPatientProfilesScreen';

export default async function AdminPatientProfilesRoute() {
  await requirePlatformAdmin();
  return <AdminPatientProfilesScreen />;
}
