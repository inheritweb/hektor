import { AdminOrganisationGroupDetailScreen } from './AdminOrganisationGroupDetailScreen';

export default async function AdminOrganisationGroupDetailRoute({
  params,
}: {
  params: Promise<{ groupId: string; organisationId: string }>;
}) {
  const { groupId, organisationId } = await params;
  return (
    <AdminOrganisationGroupDetailScreen
      groupId={groupId}
      organisationId={organisationId}
    />
  );
}
