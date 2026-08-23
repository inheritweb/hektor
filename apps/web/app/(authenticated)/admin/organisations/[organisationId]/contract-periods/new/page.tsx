import { AdminOrganisationContractPeriodCreateScreen } from './AdminOrganisationContractPeriodCreateScreen';

export default async function AdminOrganisationContractPeriodCreateRoute({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  return (
    <AdminOrganisationContractPeriodCreateScreen
      organisationId={organisationId}
    />
  );
}
