'use client';

import { useRouter } from 'next/navigation';

import { useAdminCreateOrganisation } from '@hektor/query/organisations';
import { AdminOrganisationFormPage } from '@hektor/ui/pages';

export function AdminOrganisationCreateScreen() {
  const router = useRouter();
  const create = useAdminCreateOrganisation({
    onSuccess: ({ data }) => router.push(`/admin/organisations/${data.id}`),
  });

  return (
    <AdminOrganisationFormPage
      cancelHref="/admin/organisations"
      error={create.error?.message}
      mode="create"
      onSubmit={({ name, slug }) => create.mutate({ body: { name, slug } })}
      pending={create.isPending}
    />
  );
}
