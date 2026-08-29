import { OrganisationCohortEditScreen } from './OrganisationCohortEditScreen';

export default async function OrganisationCohortEditRoute({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  return <OrganisationCohortEditScreen cohortId={cohortId} />;
}
