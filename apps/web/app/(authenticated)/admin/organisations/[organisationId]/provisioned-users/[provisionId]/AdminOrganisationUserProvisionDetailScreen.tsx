'use client';

import { useAdminGetOrganisationUserProvision } from '@hektor/query/organisations';
import { AdminOrganisationUserProvisionDetailPage } from '@hektor/ui/pages';

export function AdminOrganisationUserProvisionDetailScreen({
  organisationId,
  provisionId,
}: {
  organisationId: string;
  provisionId: string;
}) {
  const provision = useAdminGetOrganisationUserProvision({
    params: { organisationId, provisionId },
  });

  if (provision.isPending)
    return (
      <div
        aria-label="Loading provisioned user"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  if (provision.isError)
    return (
      <section>
        <h1 className="text-2xl font-bold">
          We couldn&apos;t load this provisioned user.
        </h1>
        <p className="mt-2 text-muted-foreground">{provision.error.message}</p>
      </section>
    );

  return (
    <AdminOrganisationUserProvisionDetailPage
      getGroupHref={(group) =>
        `/admin/organisations/${organisationId}/groups/${group.id}`
      }
      getUserHref={(user) => `/admin/users/${user.id}`}
      provision={provision.data.data}
    />
  );
}
