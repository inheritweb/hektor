import { AdminOrganisationCohortEditScreen } from './AdminOrganisationCohortEditScreen';

export default async function AdminOrganisationCohortEditRoute({
  params,
}: {
  params: Promise<{ cohortId: string; organisationId: string }>;
}) {
  const { cohortId, organisationId } = await params;
  return (
    <AdminOrganisationCohortEditScreen
      cohortId={cohortId}
      organisationId={organisationId}
    />
  );
}
