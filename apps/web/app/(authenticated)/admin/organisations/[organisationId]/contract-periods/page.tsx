import { AdminOrganisationContractPeriodsScreen } from './AdminOrganisationContractPeriodsScreen';

export default async function AdminOrganisationContractPeriodsRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  return (
    <AdminOrganisationContractPeriodsScreen organisationId={organisationId} />
  );
}
