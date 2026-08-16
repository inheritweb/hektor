'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  useAdminGetOrganisation,
  useAdminGetOrganisationCohorts,
} from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationCohortsPage } from '@hektor/ui/pages';

const PAGE_SIZE = 20;

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function AdminOrganisationCohortsScreen({
  organisationId,
}: {
  organisationId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = positiveInteger(searchParams.get('page'), 1);
  const organisation = useAdminGetOrganisation({
    params: { organisationId },
  });
  const cohorts = useAdminGetOrganisationCohorts({
    params: { organisationId },
    query: {
      page,
      pageSize: PAGE_SIZE,
      order: 'startsOn',
      dir: SortDirection.Descending,
    },
  });

  const onPageChange = (nextPage: number) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    if (nextPage === 1) nextSearchParams.delete('page');
    else nextSearchParams.set('page', String(nextPage));
    const query = nextSearchParams.toString();
    router.replace((query ? `${pathname}?${query}` : pathname) as Route);
  };

  return (
    <AdminOrganisationCohortsPage
      cohorts={cohorts.data?.data ?? []}
      error={cohorts.error?.message ?? organisation.error?.message}
      loading={cohorts.isPending || organisation.isPending}
      onPageChange={onPageChange}
      organisationName={organisation.data?.data.name ?? 'Organisation'}
      page={page}
      pageSize={PAGE_SIZE}
      totalRecords={cohorts.data?.context.totalRecords ?? 0}
    />
  );
}
