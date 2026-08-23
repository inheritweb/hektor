'use client';

import { useAdminGetOrganisationGroup } from '@hektor/query/organisations';
import { AdminOrganisationGroupDetailPage } from '@hektor/ui/pages';

export function AdminOrganisationGroupDetailScreen({
  groupId,
  organisationId,
}: {
  groupId: string;
  organisationId: string;
}) {
  const group = useAdminGetOrganisationGroup({
    params: { groupId, organisationId },
  });
  if (group.isPending)
    return (
      <div
        aria-label="Loading group"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  if (group.isError)
    return (
      <section>
        <h1 className="text-2xl font-bold">
          We couldn&apos;t load this group.
        </h1>
        <p className="mt-2 text-muted-foreground">{group.error.message}</p>
      </section>
    );
  return (
    <AdminOrganisationGroupDetailPage
      editHref={`/admin/organisations/${organisationId}/groups/${groupId}/edit`}
      group={group.data.data}
      getProvisionHref={(provision) =>
        `/admin/organisations/${organisationId}/provisioned-users/${provision.id}`
      }
      getUserHref={(membership) => `/admin/users/${membership.user.id}`}
    />
  );
}
