import { AdminOrganisationCohortDetailScreen } from './AdminOrganisationCohortDetailScreen';

export default async function AdminOrganisationCohortDetailRoute({
  params,
}: {
  params: Promise<{ cohortId: string; organisationId: string }>;
}) {
  const { cohortId, organisationId } = await params;
  return (
    <AdminOrganisationCohortDetailScreen
      cohortId={cohortId}
      organisationId={organisationId}
    />
  );
}
