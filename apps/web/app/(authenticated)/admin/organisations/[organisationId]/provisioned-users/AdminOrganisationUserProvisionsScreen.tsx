'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useState } from 'react';

import {
  useAdminGetOrganisation,
  useAdminGetOrganisationUserProvisions,
  useAdminPreviewOrganisationProvisionImport,
  useAdminCommitOrganisationProvisionImport,
  useAdminSendOrganisationProvisionInvitations,
} from '@hektor/query/organisations';
import {
  OrganisationRole,
  ProvisioningMethod,
  ProvisioningStatus,
} from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationUserProvisionsPage } from '@hektor/ui/pages';
import {
  OrganisationInvitationManagerSheet,
  OrganisationProvisionImportSheet,
} from '@hektor/ui/organisms';

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
  const [invitationsOpen, setInvitationsOpen] = useState(false);
  const [invitationPage, setInvitationPage] = useState(1);
  const [invitationQuery, setInvitationQuery] = useState('');
  const [invitationRole, setInvitationRole] = useState<OrganisationRole>();
  const [invitationMethod, setInvitationMethod] =
    useState<ProvisioningMethod>();
  const deferredInvitationQuery = useDeferredValue(invitationQuery.trim());
  const previewImport = useAdminPreviewOrganisationProvisionImport();
  const commitImport = useAdminCommitOrganisationProvisionImport();
  const sendInvitations = useAdminSendOrganisationProvisionInvitations();
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
  const invitationCandidates = useAdminGetOrganisationUserProvisions(
    {
      params: { organisationId },
      query: {
        page: invitationPage,
        pageSize: PAGE_SIZE,
        order: 'displayName',
        dir: SortDirection.Ascending,
        provisioningMethod: invitationMethod,
        query: deferredInvitationQuery || undefined,
        role: invitationRole,
        status: ProvisioningStatus.Pending,
      },
    },
    { enabled: invitationsOpen },
  );

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
        onManageInvitations={() => {
          setInvitationPage(1);
          setInvitationQuery('');
          setInvitationRole(undefined);
          setInvitationMethod(undefined);
          sendInvitations.reset();
          setInvitationsOpen(true);
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
      <OrganisationInvitationManagerSheet
        candidates={(invitationCandidates.data?.data ?? []).map(
          (candidate) => ({
            email: candidate.provisionedUserName,
            id: candidate.id,
            invitationExpiresAt: candidate.invitationExpiresAt,
            invitationSentAt: candidate.invitationSentAt,
            name:
              candidate.provisionedDisplayName ?? candidate.provisionedUserName,
            provisioningMethod: candidate.provisioningMethod,
            role: candidate.provisionedRole,
          }),
        )}
        error={
          invitationCandidates.error?.message ?? sendInvitations.error?.message
        }
        loading={invitationCandidates.isPending}
        method={invitationMethod}
        onFilterChange={({ method, query, role }) => {
          setInvitationPage(1);
          setInvitationMethod(method);
          setInvitationQuery(query);
          setInvitationRole(role);
        }}
        onOpenChange={setInvitationsOpen}
        onPageChange={setInvitationPage}
        onSend={({ ids, selectAllMatching }) =>
          sendInvitations.mutate({
            params: { organisationId },
            body: {
              selection: selectAllMatching
                ? {
                    type: 'filter',
                    provisioningMethod: invitationMethod,
                    query: deferredInvitationQuery || undefined,
                    role: invitationRole,
                  }
                : { type: 'ids', ids: ids ?? [] },
            },
          })
        }
        open={invitationsOpen}
        page={invitationPage}
        pageSize={PAGE_SIZE}
        pending={sendInvitations.isPending}
        query={invitationQuery}
        result={sendInvitations.data?.data}
        role={invitationRole}
        totalRecords={invitationCandidates.data?.context.totalRecords ?? 0}
      />
    </>
  );
}
