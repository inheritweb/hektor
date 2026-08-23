import { AdminOrganisationCohortCreateScreen } from './AdminOrganisationCohortCreateScreen';

export default async function AdminOrganisationCohortCreateRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  return (
    <AdminOrganisationCohortCreateScreen organisationId={organisationId} />
  );
}
