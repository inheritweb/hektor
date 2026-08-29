'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { useCreateOrganisationCohort } from '@hektor/query/organisations';
import { AdminOrganisationCohortFormPage } from '@hektor/ui/pages';

export function OrganisationCohortCreateScreen() {
  const router = useRouter();
  const create = useCreateOrganisationCohort({
    onSuccess: ({ data }) => router.push(`/cohorts/${data.id}` as Route),
  });

  return (
    <AdminOrganisationCohortFormPage
      cancelHref="/cohorts"
      error={create.error?.message}
      mode="create"
      onSubmit={({ endsOn, name, startsOn }) =>
        create.mutate({ body: { endsOn, name, startsOn } })
      }
      pending={create.isPending}
    />
  );
}
