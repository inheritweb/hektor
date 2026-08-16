'use client';

import { useAdminGetOrganisationCohort } from '@hektor/query/organisations';
import { AdminOrganisationCohortDetailPage } from '@hektor/ui/pages';

export function AdminOrganisationCohortDetailScreen({
  cohortId,
  organisationId,
}: {
  cohortId: string;
  organisationId: string;
}) {
  const cohort = useAdminGetOrganisationCohort({
    params: { cohortId, organisationId },
  });

  if (cohort.isPending) {
    return (
      <div aria-label="Loading cohort" className="space-y-4">
        <div className="h-16 animate-pulse bg-accent/70" />
        <div className="h-40 animate-pulse bg-accent/50" />
        <div className="h-64 animate-pulse bg-accent/40" />
      </div>
    );
  }

  if (cohort.isError) {
    return (
      <section>
        <h1 className="text-2xl font-bold">
          We couldn&apos;t load this cohort.
        </h1>
        <p className="mt-2 text-muted-foreground">{cohort.error.message}</p>
      </section>
    );
  }

  return (
    <AdminOrganisationCohortDetailPage
      cohort={cohort.data.data}
      getUserHref={(learner) => `/admin/users/${learner.user.id}`}
    />
  );
}
