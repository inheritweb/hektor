'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useCreateOrganisationUserProvision } from '@hektor/query/organisations';
import { OrganisationUserProvisionFormPage } from '@hektor/ui/pages';

export function OrganisationUserProvisionCreateScreen() {
  const router = useRouter();
  const create = useCreateOrganisationUserProvision({
    onSuccess: () => router.push('/users/provisions' as Route),
  });
  return (
    <OrganisationUserProvisionFormPage
      cancelHref="/users/provisions"
      error={create.error?.message}
      onSubmit={(body) => create.mutate({ body })}
      pending={create.isPending}
    />
  );
}
