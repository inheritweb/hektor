'use client';

import { useGetOrganisationMembership } from '@hektor/query/organisations';
import { AdminOrganisationMembershipDetailPage } from '@hektor/ui/pages';

export function OrganisationMembershipDetailScreen({
  membershipId,
}: {
  membershipId: string;
}) {
  const membership = useGetOrganisationMembership({ params: { membershipId } });

  if (membership.isPending) {
    return (
      <div
        aria-label="Loading organisation user"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  }
  if (membership.isError) {
    return (
      <section>
        <h1 className="text-2xl font-bold">
          We couldn&apos;t load this organisation user.
        </h1>
        <p className="mt-2 text-muted-foreground">{membership.error.message}</p>
      </section>
    );
  }

  return (
    <AdminOrganisationMembershipDetailPage
      editHref={`/users/${membershipId}/edit`}
      membership={membership.data.data}
    />
  );
}
