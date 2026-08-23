import { AdminOrganisationContractPeriodEditScreen } from './AdminOrganisationContractPeriodEditScreen';

export default async function AdminOrganisationContractPeriodEditRoute({
  params,
}: {
  params: Promise<{ contractPeriodId: string; organisationId: string }>;
}) {
  const { contractPeriodId, organisationId } = await params;
  return (
    <AdminOrganisationContractPeriodEditScreen
      contractPeriodId={contractPeriodId}
      organisationId={organisationId}
    />
  );
}
