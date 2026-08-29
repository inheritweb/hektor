'use client';

import { useGetOrganisationCohort } from '@hektor/query/organisations';
import { AdminOrganisationCohortDetailPage } from '@hektor/ui/pages';

export function OrganisationCohortDetailScreen({
  cohortId,
}: {
  cohortId: string;
}) {
  const cohort = useGetOrganisationCohort({ params: { cohortId } });

  if (cohort.isPending) {
    return (
      <div
        aria-label="Loading cohort"
        className="h-72 animate-pulse bg-accent/50"
      />
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
      editHref={`/cohorts/${cohortId}/edit`}
      getUserHref={(learner) => `/users/${learner.id}`}
    />
  );
}
