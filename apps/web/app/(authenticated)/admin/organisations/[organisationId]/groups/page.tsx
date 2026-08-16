import { AdminOrganisationGroupsScreen } from './AdminOrganisationGroupsScreen';

export default async function AdminOrganisationGroupsRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  return <AdminOrganisationGroupsScreen organisationId={organisationId} />;
}
