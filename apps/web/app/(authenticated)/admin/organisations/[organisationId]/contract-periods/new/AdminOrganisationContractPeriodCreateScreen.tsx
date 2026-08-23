'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { useAdminCreateOrganisationContractPeriod } from '@hektor/query/organisations';
import { AdminOrganisationContractPeriodFormPage } from '@hektor/ui/pages';

export function AdminOrganisationContractPeriodCreateScreen({
  organisationId,
}: {
  organisationId: string;
}) {
  const router = useRouter();
  const directoryHref = `/admin/organisations/${organisationId}/contract-periods`;
  const create = useAdminCreateOrganisationContractPeriod({
    onSuccess: () => router.push(directoryHref as Route),
  });

  return (
    <AdminOrganisationContractPeriodFormPage
      cancelHref={directoryHref}
      error={create.error?.message}
      mode="create"
      onSubmit={(body) => create.mutate({ params: { organisationId }, body })}
      pending={create.isPending}
    />
  );
}
