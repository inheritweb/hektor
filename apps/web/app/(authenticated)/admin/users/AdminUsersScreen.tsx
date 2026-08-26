'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';

import { useAdminGetUsers } from '@hektor/query/users';
import { SortDirection } from '@hektor/types/contracts';
import { AdminUsersPage } from '@hektor/ui/pages';

const PAGE_SIZE = 20;

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function AdminUsersScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = positiveInteger(searchParams.get('page'), 1);
  const users = useAdminGetUsers({
    query: {
      page,
      pageSize: PAGE_SIZE,
      order: 'createdAt',
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
    <AdminUsersPage
      addUserHref="/admin/users/new"
      error={users.error?.message}
      getUserHref={(user) => `/admin/users/${user.id}`}
      loading={users.isPending}
      onPageChange={onPageChange}
      page={page}
      pageSize={PAGE_SIZE}
      totalRecords={users.data?.context.totalRecords ?? 0}
      users={users.data?.data ?? []}
    />
  );
}
