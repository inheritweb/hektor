import { requirePlatformAdmin } from '@/lib/auth/platform-admin';

import { ScenarioEhrPreviewScreen } from './ScenarioEhrPreviewScreen';

export default async function ScenarioEhrPreviewRoute({
  params,
}: {
  params: Promise<{ scenarioSlug: string }>;
}) {
  await requirePlatformAdmin();
  const { scenarioSlug } = await params;

  return <ScenarioEhrPreviewScreen scenarioSlug={scenarioSlug} />;
}
