'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import {
  useAdminGetOrganisationCohort,
  useAdminUpdateOrganisationCohort,
} from '@hektor/query/organisations';
import { AdminOrganisationCohortFormPage } from '@hektor/ui/pages';

export function AdminOrganisationCohortEditScreen({
  cohortId,
  organisationId,
}: {
  cohortId: string;
  organisationId: string;
}) {
  const router = useRouter();
  const detailHref = `/admin/organisations/${organisationId}/cohorts/${cohortId}`;
  const cohort = useAdminGetOrganisationCohort({
    params: { cohortId, organisationId },
  });
  const update = useAdminUpdateOrganisationCohort({
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
          params: { cohortId, organisationId },
          body: { ...body, expectedUpdatedAt: cohort.data.data.updatedAt },
        })
      }
      pending={update.isPending}
    />
  );
}
