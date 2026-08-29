'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useState } from 'react';

import {
  useGetOrganisationUserProvisions,
  useGetTenantOrganisationContext,
  useSendOrganisationProvisionInvitations,
} from '@hektor/query/organisations';
import {
  OrganisationRole,
  ProvisioningMethod,
  ProvisioningStatus,
} from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';
import { OrganisationInvitationManagerSheet } from '@hektor/ui/organisms';
import { AdminOrganisationUserProvisionsPage } from '@hektor/ui/pages';

const PAGE_SIZE = 20;

export function OrganisationUserProvisionsScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const [invitationsOpen, setInvitationsOpen] = useState(false);
  const [invitationPage, setInvitationPage] = useState(1);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<OrganisationRole>();
  const [method, setMethod] = useState<ProvisioningMethod>();
  const deferredQuery = useDeferredValue(query.trim());
  const organisation = useGetTenantOrganisationContext();
  const provisions = useGetOrganisationUserProvisions({
    query: {
      page,
      pageSize: PAGE_SIZE,
      order: 'displayName',
      dir: SortDirection.Ascending,
    },
  });
  const candidates = useGetOrganisationUserProvisions(
    {
      query: {
        page: invitationPage,
        pageSize: PAGE_SIZE,
        order: 'displayName',
        dir: SortDirection.Ascending,
        provisioningMethod: method,
        query: deferredQuery || undefined,
        role,
        status: ProvisioningStatus.Pending,
      },
    },
    { enabled: invitationsOpen },
  );
  const sendInvitations = useSendOrganisationProvisionInvitations();

  const onPageChange = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage === 1) next.delete('page');
    else next.set('page', String(nextPage));
    router.replace(`${pathname}${next.size ? `?${next}` : ''}` as Route);
  };

  return (
    <>
      <AdminOrganisationUserProvisionsPage
        error={provisions.error?.message ?? organisation.error?.message}
        getProvisionHref={({ id }) => `/users/provisions/${id}`}
        loading={provisions.isPending || organisation.isPending}
        onCreateProvision={() => router.push('/users/provisions/new' as Route)}
        onManageInvitations={() => {
          setInvitationPage(1);
          setQuery('');
          setRole(undefined);
          setMethod(undefined);
          sendInvitations.reset();
          setInvitationsOpen(true);
        }}
        onPageChange={onPageChange}
        organisationName={
          organisation.data?.data.organisation.name ?? 'Organisation'
        }
        page={page}
        pageSize={PAGE_SIZE}
        provisions={provisions.data?.data ?? []}
        totalRecords={provisions.data?.context.totalRecords ?? 0}
      />
      <OrganisationInvitationManagerSheet
        candidates={(candidates.data?.data ?? []).map((candidate) => ({
          email: candidate.provisionedUserName,
          id: candidate.id,
          invitationExpiresAt: candidate.invitationExpiresAt,
          invitationSentAt: candidate.invitationSentAt,
          name:
            candidate.provisionedDisplayName ?? candidate.provisionedUserName,
          provisioningMethod: candidate.provisioningMethod,
          role: candidate.provisionedRole,
        }))}
        error={candidates.error?.message ?? sendInvitations.error?.message}
        loading={candidates.isPending}
        method={method}
        onFilterChange={(filters) => {
          setInvitationPage(1);
          setMethod(filters.method);
          setQuery(filters.query);
          setRole(filters.role);
        }}
        onOpenChange={setInvitationsOpen}
        onPageChange={setInvitationPage}
        onSend={({ ids, selectAllMatching }) =>
          sendInvitations.mutate({
            body: {
              selection: selectAllMatching
                ? {
                    type: 'filter',
                    provisioningMethod: method,
                    query: deferredQuery || undefined,
                    role,
                  }
                : { type: 'ids', ids: ids ?? [] },
            },
          })
        }
        open={invitationsOpen}
        page={invitationPage}
        pageSize={PAGE_SIZE}
        pending={sendInvitations.isPending}
        query={query}
        result={sendInvitations.data?.data}
        role={role}
        totalRecords={candidates.data?.context.totalRecords ?? 0}
      />
    </>
  );
}
