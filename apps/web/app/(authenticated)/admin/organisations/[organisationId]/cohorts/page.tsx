import { AdminOrganisationCohortsScreen } from './AdminOrganisationCohortsScreen';

export default async function AdminOrganisationCohortsRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  return <AdminOrganisationCohortsScreen organisationId={organisationId} />;
}
