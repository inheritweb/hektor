'use client';

import { useRouter } from 'next/navigation';

import {
  useAdminGetOrganisation,
  useAdminUpdateOrganisation,
} from '@hektor/query/organisations';
import { AdminOrganisationFormPage } from '@hektor/ui/pages';

export function AdminOrganisationEditScreen({
  organisationId,
}: {
  organisationId: string;
}) {
  const router = useRouter();
  const organisation = useAdminGetOrganisation({ params: { organisationId } });
  const update = useAdminUpdateOrganisation({
    onSuccess: () => router.push(`/admin/organisations/${organisationId}`),
  });

  if (organisation.isPending) {
    return (
      <div
        aria-label="Loading organisation"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  }

  if (organisation.isError) {
    return <p className="text-destructive">{organisation.error.message}</p>;
  }

  return (
    <AdminOrganisationFormPage
      cancelHref={`/admin/organisations/${organisationId}`}
      error={update.error?.message}
      initialValues={{
        name: organisation.data.data.name,
        slug: organisation.data.data.slug,
        status: organisation.data.data.status,
      }}
      mode="edit"
      onSubmit={(values) =>
        update.mutate({
          params: { organisationId },
          body: {
            ...values,
            expectedStatus: organisation.data.data.status,
          },
        })
      }
      pending={update.isPending}
    />
  );
}
