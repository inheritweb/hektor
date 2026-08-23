import { AdminOrganisationGroupCreateScreen } from './AdminOrganisationGroupCreateScreen';

export default async function AdminOrganisationGroupCreateRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  return <AdminOrganisationGroupCreateScreen organisationId={organisationId} />;
}
