'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  useGetOrganisationGroups,
  useGetTenantOrganisationContext,
} from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationGroupsPage } from '@hektor/ui/pages';

const PAGE_SIZE = 20;

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function OrganisationGroupsScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = positiveInteger(searchParams.get('page'), 1);
  const organisation = useGetTenantOrganisationContext();
  const groups = useGetOrganisationGroups({
    query: {
      page,
      pageSize: PAGE_SIZE,
      order: 'name',
      dir: SortDirection.Ascending,
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
    <AdminOrganisationGroupsPage
      createHref="/groups/new"
      error={groups.error?.message ?? organisation.error?.message}
      getGroupHref={(group) => `/groups/${group.id}`}
      groups={groups.data?.data ?? []}
      loading={groups.isPending || organisation.isPending}
      onPageChange={onPageChange}
      organisationName={
        organisation.data?.data.organisation.name ?? 'Organisation'
      }
      page={page}
      pageSize={PAGE_SIZE}
      totalRecords={groups.data?.context.totalRecords ?? 0}
    />
  );
}
