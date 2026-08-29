'use client';

import { useGetOrganisationGroup } from '@hektor/query/organisations';
import { AdminOrganisationGroupDetailPage } from '@hektor/ui/pages';

export function OrganisationGroupDetailScreen({
  groupId,
}: {
  groupId: string;
}) {
  const group = useGetOrganisationGroup({ params: { groupId } });

  if (group.isPending) {
    return (
      <div
        aria-label="Loading group"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  }

  if (group.isError) {
    return (
      <section>
        <h1 className="text-2xl font-bold">
          We couldn&apos;t load this group.
        </h1>
        <p className="mt-2 text-muted-foreground">{group.error.message}</p>
      </section>
    );
  }

  return (
    <AdminOrganisationGroupDetailPage
      editHref={`/groups/${groupId}/edit`}
      getUserHref={(membership) => `/users/${membership.id}`}
      group={group.data.data}
    />
  );
}
