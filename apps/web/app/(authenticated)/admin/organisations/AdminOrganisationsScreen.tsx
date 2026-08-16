'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useAdminGetOrganisations } from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationsPage } from '@hektor/ui/pages';

const PAGE_SIZE = 20;

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function AdminOrganisationsScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = positiveInteger(searchParams.get('page'), 1);
  const organisations = useAdminGetOrganisations({
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
    <AdminOrganisationsPage
      error={organisations.error?.message}
      getOrganisationHref={(organisation) =>
        `/admin/organisations/${organisation.id}`
      }
      loading={organisations.isPending}
      onPageChange={onPageChange}
      organisations={organisations.data?.data ?? []}
      page={page}
      pageSize={PAGE_SIZE}
      totalRecords={organisations.data?.context.totalRecords ?? 0}
    />
  );
}
