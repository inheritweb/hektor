import { AdminOrganisationEditScreen } from './AdminOrganisationEditScreen';

export default async function Page({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) {
  const { organisationId } = await params;
  return <AdminOrganisationEditScreen organisationId={organisationId} />;
}
