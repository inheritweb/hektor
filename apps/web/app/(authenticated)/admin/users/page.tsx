import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminUsersScreen } from './AdminUsersScreen';

export default async function AdminUsersRoute() {
  await requirePlatformAdmin();
  return <AdminUsersScreen />;
}
