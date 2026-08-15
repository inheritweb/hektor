import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminUserDetailScreen } from './AdminUserDetailScreen';

export default async function AdminUserDetailRoute({
  params,
}: Readonly<{ params: Promise<{ userId: string }> }>) {
  await requirePlatformAdmin();
  const { userId } = await params;
  return <AdminUserDetailScreen userId={userId} />;
}
