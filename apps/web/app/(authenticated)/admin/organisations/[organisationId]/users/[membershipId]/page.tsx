import { AdminOrganisationMembershipDetailScreen } from './AdminOrganisationMembershipDetailScreen';

export default async function AdminOrganisationMembershipDetailRoute({
  params,
}: {
  params: Promise<{ membershipId: string; organisationId: string }>;
}) {
  const { membershipId, organisationId } = await params;
  return (
    <AdminOrganisationMembershipDetailScreen
      membershipId={membershipId}
      organisationId={organisationId}
    />
  );
}
