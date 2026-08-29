'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import {
  useGetOrganisationCohorts,
  useGetOrganisationMembership,
  useUpdateOrganisationMembership,
} from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationMembershipFormPage } from '@hektor/ui/pages';

export function OrganisationMembershipEditScreen({
  membershipId,
}: {
  membershipId: string;
}) {
  const router = useRouter();
  const detailHref = `/users/${membershipId}`;
  const membership = useGetOrganisationMembership({ params: { membershipId } });
  const cohorts = useGetOrganisationCohorts({
    query: {
      page: 1,
      pageSize: 100,
      order: 'name',
      dir: SortDirection.Ascending,
    },
  });
  const update = useUpdateOrganisationMembership({
    onSuccess: () => router.push(detailHref as Route),
  });

  if (membership.isPending || cohorts.isPending) {
    return (
      <div
        aria-label="Loading organisation user"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  }
  if (membership.isError || cohorts.isError) {
    return (
      <p className="text-destructive">
        {membership.error?.message ?? cohorts.error?.message}
      </p>
    );
  }

  const data = membership.data.data;
  return (
    <AdminOrganisationMembershipFormPage
      cancelHref={detailHref}
      cohorts={cohorts.data.data}
      error={update.error?.message}
      initialValues={{
        cohortId: data.cohort?.id,
        role: data.role,
        status: data.status,
      }}
      onSubmit={(body) =>
        update.mutate({
          params: { membershipId },
          body: { ...body, expectedUpdatedAt: data.updatedAt },
        })
      }
      pending={update.isPending}
      provisionControlled={Boolean(data.provisioning)}
      userName={data.user.displayName}
    />
  );
}
