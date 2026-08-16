import { AdminOrganisationDetailScreen } from './AdminOrganisationDetailScreen';

export default async function AdminOrganisationDetailRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  return <AdminOrganisationDetailScreen organisationId={organisationId} />;
}
