'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useAdminCreateUser } from '@hektor/query/users';
import { AdminUserFormPage } from '@hektor/ui/pages';

export function AdminUserCreateScreen() {
  const router = useRouter();
  const create = useAdminCreateUser({
    onSuccess: ({ data }) => router.push(`/admin/users/${data.id}` as Route),
  });
  return (
    <AdminUserFormPage
      cancelHref="/admin/users"
      error={create.error?.message}
      onSubmit={(body) => create.mutate({ body })}
      pending={create.isPending}
    />
  );
}
