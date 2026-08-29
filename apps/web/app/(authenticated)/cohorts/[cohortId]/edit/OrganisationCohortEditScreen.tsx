'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import {
  useGetOrganisationCohort,
  useUpdateOrganisationCohort,
} from '@hektor/query/organisations';
import { AdminOrganisationCohortFormPage } from '@hektor/ui/pages';

export function OrganisationCohortEditScreen({
  cohortId,
}: {
  cohortId: string;
}) {
  const router = useRouter();
  const detailHref = `/cohorts/${cohortId}`;
  const cohort = useGetOrganisationCohort({ params: { cohortId } });
  const update = useUpdateOrganisationCohort({
    onSuccess: () => router.push(detailHref as Route),
  });

  if (cohort.isPending) {
    return (
      <div
        aria-label="Loading cohort"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  }

  if (cohort.isError) {
    return <p className="text-destructive">{cohort.error.message}</p>;
  }

  return (
    <AdminOrganisationCohortFormPage
      cancelHref={detailHref}
      error={update.error?.message}
      initialValues={{
        endsOn: cohort.data.data.endsOn,
        name: cohort.data.data.name,
        startsOn: cohort.data.data.startsOn,
        status: cohort.data.data.status,
      }}
      mode="edit"
      onSubmit={(body) =>
        update.mutate({
          params: { cohortId },
          body: { ...body, expectedUpdatedAt: cohort.data.data.updatedAt },
        })
      }
      pending={update.isPending}
    />
  );
}
