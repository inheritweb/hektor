'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import {
  useAdminCreateOrganisationGroup,
  useAdminGetOrganisationCohorts,
} from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationGroupFormPage } from '@hektor/ui/pages';

export function AdminOrganisationGroupCreateScreen({
  organisationId,
}: {
  organisationId: string;
}) {
  const router = useRouter();
  const directoryHref = `/admin/organisations/${organisationId}/groups`;
  const cohorts = useAdminGetOrganisationCohorts({
    params: { organisationId },
    query: {
      page: 1,
      pageSize: 100,
      order: 'name',
      dir: SortDirection.Ascending,
    },
  });
  const create = useAdminCreateOrganisationGroup({
    onSuccess: ({ data }) =>
      router.push(`${directoryHref}/${data.id}` as Route),
  });

  return (
    <AdminOrganisationGroupFormPage
      cancelHref={directoryHref}
      cohorts={cohorts.data?.data ?? []}
      error={create.error?.message ?? cohorts.error?.message}
      mode="create"
      onSubmit={({ cohortId, name }) =>
        create.mutate({ params: { organisationId }, body: { cohortId, name } })
      }
      pending={create.isPending || cohorts.isPending}
    />
  );
}
