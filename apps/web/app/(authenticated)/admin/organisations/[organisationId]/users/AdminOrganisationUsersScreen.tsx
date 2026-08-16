'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  useAdminGetOrganisation,
  useAdminGetOrganisationUsers,
} from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationUsersPage } from '@hektor/ui/pages';

const PAGE_SIZE = 20;

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function AdminOrganisationUsersScreen({
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
  const users = useAdminGetOrganisationUsers({
    params: { organisationId },
    query: {
      page,
      pageSize: PAGE_SIZE,
      order: 'userName',
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
    <AdminOrganisationUsersPage
      error={users.error?.message ?? organisation.error?.message}
      loading={users.isPending || organisation.isPending}
      onPageChange={onPageChange}
      organisation={organisation.data?.data}
      page={page}
      pageSize={PAGE_SIZE}
      totalRecords={users.data?.context.totalRecords ?? 0}
      users={users.data?.data ?? []}
    />
  );
}
