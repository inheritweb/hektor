import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminOrganisationsScreen } from './AdminOrganisationsScreen';

export default async function AdminOrganisationsRoute() {
  await requirePlatformAdmin();
  return <AdminOrganisationsScreen />;
}
