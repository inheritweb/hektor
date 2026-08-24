'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import {
  useAdminGetOrganisationCohorts,
  useAdminGetOrganisationMembership,
  useAdminUpdateOrganisationMembership,
} from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationMembershipFormPage } from '@hektor/ui/pages';

export function AdminOrganisationMembershipEditScreen({
  membershipId,
  organisationId,
}: {
  membershipId: string;
  organisationId: string;
}) {
  const router = useRouter();
  const detailHref = `/admin/organisations/${organisationId}/users/${membershipId}`;
  const membership = useAdminGetOrganisationMembership({
    params: { membershipId, organisationId },
  });
  const cohorts = useAdminGetOrganisationCohorts({
    params: { organisationId },
    query: {
      page: 1,
      pageSize: 100,
      order: 'name',
      dir: SortDirection.Ascending,
    },
  });
  const update = useAdminUpdateOrganisationMembership({
    onSuccess: () => router.push(detailHref as Route),
  });
  if (membership.isPending || cohorts.isPending)
    return (
      <div
        aria-label="Loading organisation user"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  if (membership.isError || cohorts.isError)
    return (
      <p className="text-destructive">
        {membership.error?.message ?? cohorts.error?.message}
      </p>
    );
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
          params: { membershipId, organisationId },
          body: { ...body, expectedUpdatedAt: data.updatedAt },
        })
      }
      pending={update.isPending}
      provisionControlled={Boolean(data.provisioning)}
      userName={data.user.displayName}
    />
  );
}
