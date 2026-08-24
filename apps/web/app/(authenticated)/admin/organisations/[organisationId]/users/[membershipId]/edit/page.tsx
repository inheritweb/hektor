import { AdminOrganisationMembershipEditScreen } from './AdminOrganisationMembershipEditScreen';

export default async function AdminOrganisationMembershipEditRoute({
  params,
}: {
  params: Promise<{ membershipId: string; organisationId: string }>;
}) {
  const { membershipId, organisationId } = await params;
  return (
    <AdminOrganisationMembershipEditScreen
      membershipId={membershipId}
      organisationId={organisationId}
    />
  );
}
