import { AdminOrganisationUserProvisionDetailScreen } from './AdminOrganisationUserProvisionDetailScreen';

export default async function AdminOrganisationUserProvisionDetailRoute({
  params,
}: {
  params: Promise<{ organisationId: string; provisionId: string }>;
}) {
  const { organisationId, provisionId } = await params;
  return (
    <AdminOrganisationUserProvisionDetailScreen
      organisationId={organisationId}
      provisionId={provisionId}
    />
  );
}
