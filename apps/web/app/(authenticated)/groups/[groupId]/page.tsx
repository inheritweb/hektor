import { OrganisationGroupDetailScreen } from './OrganisationGroupDetailScreen';

export default async function OrganisationGroupDetailRoute({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return <OrganisationGroupDetailScreen groupId={groupId} />;
}
