import { AdminOrganisationUsersScreen } from './AdminOrganisationUsersScreen';

export default async function AdminOrganisationUsersRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  return <AdminOrganisationUsersScreen organisationId={organisationId} />;
}
