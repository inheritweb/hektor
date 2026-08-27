'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  useAdminGetOrganisation,
  useAdminGetOrganisationUserProvisions,
  useAdminPreviewOrganisationProvisionImport,
  useAdminCommitOrganisationProvisionImport,
} from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationUserProvisionsPage } from '@hektor/ui/pages';
import { OrganisationProvisionImportSheet } from '@hektor/ui/organisms';

const PAGE_SIZE = 20;

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function AdminOrganisationUserProvisionsScreen({
  organisationId,
}: {
  organisationId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = positiveInteger(searchParams.get('page'), 1);
  const [importOpen, setImportOpen] = useState(false);
  const previewImport = useAdminPreviewOrganisationProvisionImport();
  const commitImport = useAdminCommitOrganisationProvisionImport();
  const organisation = useAdminGetOrganisation({
    params: { organisationId },
  });
  const provisions = useAdminGetOrganisationUserProvisions({
    params: { organisationId },
    query: {
      page,
      pageSize: PAGE_SIZE,
      order: 'displayName',
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
    <>
      <AdminOrganisationUserProvisionsPage
        error={provisions.error?.message ?? organisation.error?.message}
        getProvisionHref={(provision) =>
          `/admin/organisations/${organisationId}/provisioned-users/${provision.id}`
        }
        loading={provisions.isPending || organisation.isPending}
        onPageChange={onPageChange}
        onImportUsers={() => {
          previewImport.reset();
          commitImport.reset();
          setImportOpen(true);
        }}
        organisationName={organisation.data?.data.name ?? 'Organisation'}
        page={page}
        pageSize={PAGE_SIZE}
        provisions={provisions.data?.data ?? []}
        totalRecords={provisions.data?.context.totalRecords ?? 0}
      />
      <OrganisationProvisionImportSheet
        error={previewImport.error?.message ?? commitImport.error?.message}
        onCommit={(body) =>
          commitImport.mutate({ params: { organisationId }, body })
        }
        onOpenChange={setImportOpen}
        onPreview={(rows) =>
          previewImport.mutate({
            params: { organisationId },
            body: { rows },
          })
        }
        open={importOpen}
        pending={previewImport.isPending || commitImport.isPending}
        preview={previewImport.data?.data}
        result={commitImport.data?.data}
      />
    </>
  );
}
