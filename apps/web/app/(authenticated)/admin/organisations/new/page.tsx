import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { AdminOrganisationCreateScreen } from './AdminOrganisationCreateScreen';

export default async function Page() {
  await requirePlatformAdmin();
  return <AdminOrganisationCreateScreen />;
}
