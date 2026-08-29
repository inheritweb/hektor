import { OrganisationUserProvisionDetailScreen } from './OrganisationUserProvisionDetailScreen';

export default async function OrganisationUserProvisionDetailRoute({
  params,
}: {
  params: Promise<{ provisionId: string }>;
}) {
  const { provisionId } = await params;
  return <OrganisationUserProvisionDetailScreen provisionId={provisionId} />;
}
