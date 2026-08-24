'use client';

import { useAdminGetOrganisationMembership } from '@hektor/query/organisations';
import { AdminOrganisationMembershipDetailPage } from '@hektor/ui/pages';

export function AdminOrganisationMembershipDetailScreen({
  membershipId,
  organisationId,
}: {
  membershipId: string;
  organisationId: string;
}) {
  const membership = useAdminGetOrganisationMembership({
    params: { membershipId, organisationId },
  });
  if (membership.isPending)
    return (
      <div
        aria-label="Loading organisation user"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  if (membership.isError)
    return (
      <section>
        <h1 className="text-2xl font-bold">
          We couldn&apos;t load this organisation user.
        </h1>
        <p className="mt-2 text-muted-foreground">{membership.error.message}</p>
      </section>
    );
  const data = membership.data.data;
  return (
    <AdminOrganisationMembershipDetailPage
      editHref={`/admin/organisations/${organisationId}/users/${membershipId}/edit`}
      getGroupHref={(groupId) =>
        `/admin/organisations/${organisationId}/groups/${groupId}`
      }
      membership={data}
      provisionHref={
        data.provisioning
          ? `/admin/organisations/${organisationId}/provisioned-users/${data.provisioning.id}`
          : undefined
      }
    />
  );
}
