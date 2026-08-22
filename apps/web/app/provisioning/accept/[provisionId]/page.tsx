import { requireAuthenticated } from '@/lib/auth/platform-admin';

import { ProvisionAcceptanceScreen } from './ProvisionAcceptanceScreen';

export default async function Page({
  params,
}: {
  params: Promise<{ provisionId: string }>;
}) {
  await requireAuthenticated();
  const { provisionId } = await params;

  return <ProvisionAcceptanceScreen provisionId={provisionId} />;
}
