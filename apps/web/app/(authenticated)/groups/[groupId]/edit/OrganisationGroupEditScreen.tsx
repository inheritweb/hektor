'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import {
  useGetOrganisationCohorts,
  useGetOrganisationGroup,
  useUpdateOrganisationGroup,
} from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationGroupFormPage } from '@hektor/ui/pages';

export function OrganisationGroupEditScreen({ groupId }: { groupId: string }) {
  const router = useRouter();
  const detailHref = `/groups/${groupId}`;
  const group = useGetOrganisationGroup({ params: { groupId } });
  const cohorts = useGetOrganisationCohorts({
    query: {
      page: 1,
      pageSize: 100,
      order: 'name',
      dir: SortDirection.Ascending,
    },
  });
  const update = useUpdateOrganisationGroup({
    onSuccess: () => router.push(detailHref as Route),
  });

  if (group.isPending || cohorts.isPending) {
    return (
      <div
        aria-label="Loading group"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  }

  if (group.isError || cohorts.isError) {
    return (
      <p className="text-destructive">
        {group.error?.message ?? cohorts.error?.message}
      </p>
    );
  }

  return (
    <AdminOrganisationGroupFormPage
      cancelHref={detailHref}
      cohorts={cohorts.data.data}
      error={update.error?.message}
      initialValues={{
        cohortId: group.data.data.cohort?.id,
        name: group.data.data.name,
        status: group.data.data.status,
      }}
      mode="edit"
      onSubmit={(body) =>
        update.mutate({
          params: { groupId },
          body: { ...body, expectedUpdatedAt: group.data.data.updatedAt },
        })
      }
      pending={update.isPending}
      source={
        group.data.data.provisioningMethod
          ? {
              externalId: group.data.data.sourceExternalId,
              method: group.data.data.provisioningMethod,
            }
          : undefined
      }
    />
  );
}
