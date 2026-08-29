import { OrganisationGroupEditScreen } from './OrganisationGroupEditScreen';

export default async function OrganisationGroupEditRoute({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return <OrganisationGroupEditScreen groupId={groupId} />;
}
