import { AdminUserCreateScreen } from './AdminUserCreateScreen';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

export default async function AdminUserCreateRoute() {
  await requirePlatformAdmin();
  return <AdminUserCreateScreen />;
}
