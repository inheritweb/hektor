import { OrganisationMembershipDetailScreen } from './OrganisationMembershipDetailScreen';

export default async function OrganisationMembershipDetailRoute({
  params,
}: {
  params: Promise<{ membershipId: string }>;
}) {
  const { membershipId } = await params;
  return <OrganisationMembershipDetailScreen membershipId={membershipId} />;
}
