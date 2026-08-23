'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { useAdminCreateOrganisationCohort } from '@hektor/query/organisations';
import { AdminOrganisationCohortFormPage } from '@hektor/ui/pages';

export function AdminOrganisationCohortCreateScreen({
  organisationId,
}: {
  organisationId: string;
}) {
  const router = useRouter();
  const directoryHref = `/admin/organisations/${organisationId}/cohorts`;
  const create = useAdminCreateOrganisationCohort({
    onSuccess: ({ data }) =>
      router.push(`${directoryHref}/${data.id}` as Route),
  });

  return (
    <AdminOrganisationCohortFormPage
      cancelHref={directoryHref}
      error={create.error?.message}
      mode="create"
      onSubmit={({ endsOn, name, startsOn }) =>
        create.mutate({
          params: { organisationId },
          body: { endsOn, name, startsOn },
        })
      }
      pending={create.isPending}
    />
  );
}
