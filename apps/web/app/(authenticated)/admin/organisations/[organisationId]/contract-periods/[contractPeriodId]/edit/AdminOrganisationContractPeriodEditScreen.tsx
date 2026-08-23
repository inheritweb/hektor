'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import {
  useAdminGetOrganisationContractPeriod,
  useAdminUpdateOrganisationContractPeriod,
} from '@hektor/query/organisations';
import { AdminOrganisationContractPeriodFormPage } from '@hektor/ui/pages';

export function AdminOrganisationContractPeriodEditScreen({
  contractPeriodId,
  organisationId,
}: {
  contractPeriodId: string;
  organisationId: string;
}) {
  const router = useRouter();
  const directoryHref = `/admin/organisations/${organisationId}/contract-periods`;
  const contractPeriod = useAdminGetOrganisationContractPeriod({
    params: { contractPeriodId, organisationId },
  });
  const update = useAdminUpdateOrganisationContractPeriod({
    onSuccess: () => router.push(directoryHref as Route),
  });

  if (contractPeriod.isPending) {
    return (
      <div
        aria-label="Loading contract period"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  }

  if (contractPeriod.isError) {
    return <p className="text-destructive">{contractPeriod.error.message}</p>;
  }

  return (
    <AdminOrganisationContractPeriodFormPage
      activatedSeats={contractPeriod.data.data.seats.activated}
      cancelHref={directoryHref}
      error={update.error?.message}
      initialValues={{
        endsOn: contractPeriod.data.data.endsOn,
        learnerSeatAllowance: contractPeriod.data.data.seats.allowed,
        startsOn: contractPeriod.data.data.startsOn,
      }}
      mode="edit"
      onSubmit={(body) =>
        update.mutate({
          params: { contractPeriodId, organisationId },
          body: {
            ...body,
            expectedUpdatedAt: contractPeriod.data.data.updatedAt,
          },
        })
      }
      pending={update.isPending}
    />
  );
}
