'use client';

import { useAdminGetOrganisation } from '@hektor/query/organisations';
import { AdminOrganisationDetailPage } from '@hektor/ui/pages';

export interface AdminOrganisationDetailScreenProps {
  organisationId: string;
}

export function AdminOrganisationDetailScreen({
  organisationId,
}: AdminOrganisationDetailScreenProps) {
  const organisation = useAdminGetOrganisation({
    params: { organisationId },
  });

  if (organisation.isPending) {
    return (
      <div aria-label="Loading organisation" className="space-y-4">
        <div className="h-8 w-40 animate-pulse bg-accent" />
        <div className="grid gap-10 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)]">
          <div className="h-72 animate-pulse bg-accent/70" />
          <div className="h-96 animate-pulse bg-accent/50" />
        </div>
      </div>
    );
  }

  if (organisation.isError) {
    return (
      <section>
        <h1 className="text-2xl font-bold">
          We couldn&apos;t load this organisation.
        </h1>
        <p className="mt-2 text-muted-foreground">
          {organisation.error.message}
        </p>
      </section>
    );
  }

  return (
    <AdminOrganisationDetailPage
      cohortsHref={`/admin/organisations/${organisationId}/cohorts`}
      contractPeriodsHref={`/admin/organisations/${organisationId}/contract-periods`}
      groupsHref={`/admin/organisations/${organisationId}/groups`}
      organisation={organisation.data.data}
      provisionsHref={`/admin/organisations/${organisationId}/provisioned-users`}
      usersHref={`/admin/organisations/${organisationId}/users`}
    />
  );
}
