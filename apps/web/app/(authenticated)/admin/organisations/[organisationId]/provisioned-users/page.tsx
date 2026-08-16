import { AdminOrganisationUserProvisionsScreen } from './AdminOrganisationUserProvisionsScreen';

export default async function AdminOrganisationUserProvisionsRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  return (
    <AdminOrganisationUserProvisionsScreen organisationId={organisationId} />
  );
}
