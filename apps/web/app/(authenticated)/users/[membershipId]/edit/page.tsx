import { OrganisationMembershipEditScreen } from './OrganisationMembershipEditScreen';

export default async function OrganisationMembershipEditRoute({
  params,
}: {
  params: Promise<{ membershipId: string }>;
}) {
  const { membershipId } = await params;
  return <OrganisationMembershipEditScreen membershipId={membershipId} />;
}
