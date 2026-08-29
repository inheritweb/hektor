import { OrganisationCohortDetailScreen } from './OrganisationCohortDetailScreen';

export default async function OrganisationCohortDetailRoute({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  return <OrganisationCohortDetailScreen cohortId={cohortId} />;
}
