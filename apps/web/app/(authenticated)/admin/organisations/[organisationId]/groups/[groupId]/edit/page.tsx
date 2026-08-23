import { AdminOrganisationGroupEditScreen } from './AdminOrganisationGroupEditScreen';

export default async function AdminOrganisationGroupEditRoute({
  params,
}: {
  params: Promise<{ groupId: string; organisationId: string }>;
}) {
  const { groupId, organisationId } = await params;
  return (
    <AdminOrganisationGroupEditScreen
      groupId={groupId}
      organisationId={organisationId}
    />
  );
}
