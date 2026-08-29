'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import {
  useCreateOrganisationGroup,
  useGetOrganisationCohorts,
} from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationGroupFormPage } from '@hektor/ui/pages';

export function OrganisationGroupCreateScreen() {
  const router = useRouter();
  const cohorts = useGetOrganisationCohorts({
    query: {
      page: 1,
      pageSize: 100,
      order: 'name',
      dir: SortDirection.Ascending,
    },
  });
  const create = useCreateOrganisationGroup({
    onSuccess: ({ data }) => router.push(`/groups/${data.id}` as Route),
  });

  return (
    <AdminOrganisationGroupFormPage
      cancelHref="/groups"
      cohorts={cohorts.data?.data ?? []}
      error={create.error?.message ?? cohorts.error?.message}
      mode="create"
      onSubmit={({ cohortId, name }) =>
        create.mutate({ body: { cohortId, name } })
      }
      pending={create.isPending || cohorts.isPending}
    />
  );
}
