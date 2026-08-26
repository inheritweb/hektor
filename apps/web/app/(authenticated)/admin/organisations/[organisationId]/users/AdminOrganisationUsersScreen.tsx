'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useState } from 'react';

import {
  useAdminGetOrganisation,
  useAdminCreateOrganisationMemberships,
  useAdminCreateOrganisationUser,
  useAdminGetOrganisationCohorts,
  useAdminGetOrganisationMembershipCandidates,
  useAdminGetOrganisationUsers,
} from '@hektor/query/organisations';
import { SortDirection } from '@hektor/types/contracts';
import { AdminOrganisationUsersPage } from '@hektor/ui/pages';
import {
  OrganisationMembershipCreateSheet,
  OrganisationUserCreateSheet,
} from '@hektor/ui/organisms';

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
  const [managerOpen, setManagerOpen] = useState(false);
  const [userCreateOpen, setUserCreateOpen] = useState(false);
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidateSearch, setCandidateSearch] = useState('');
  const deferredCandidateSearch = useDeferredValue(candidateSearch.trim());
  const organisation = useAdminGetOrganisation({
    params: { organisationId },
  });
  const users = useAdminGetOrganisationUsers({
    params: { organisationId },
    query: {
      page,
      pageSize: PAGE_SIZE,
      order: 'displayName',
      dir: SortDirection.Ascending,
    },
  });
  const candidates = useAdminGetOrganisationMembershipCandidates(
    {
      params: { organisationId },
      query: {
        page: candidatePage,
        pageSize: PAGE_SIZE,
        order: 'displayName',
        dir: SortDirection.Ascending,
        query: deferredCandidateSearch || undefined,
      },
    },
    { enabled: managerOpen || userCreateOpen },
  );
  const cohorts = useAdminGetOrganisationCohorts(
    {
      params: { organisationId },
      query: {
        page: 1,
        pageSize: 100,
        order: 'name',
        dir: SortDirection.Ascending,
      },
    },
    { enabled: managerOpen },
  );
  const createMemberships = useAdminCreateOrganisationMemberships({
    onSuccess: () => setManagerOpen(false),
  });
  const createUser = useAdminCreateOrganisationUser({
    onSuccess: () => setUserCreateOpen(false),
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
      <AdminOrganisationUsersPage
        error={users.error?.message ?? organisation.error?.message}
        getUserHref={(membership) =>
          `/admin/organisations/${organisationId}/users/${membership.id}`
        }
        loading={users.isPending || organisation.isPending}
        onPageChange={onPageChange}
        onConnectUsers={() => {
          setCandidatePage(1);
          setCandidateSearch('');
          setManagerOpen(true);
        }}
        onAddUser={() => setUserCreateOpen(true)}
        organisationName={organisation.data?.data.name ?? 'Organisation'}
        page={page}
        pageSize={PAGE_SIZE}
        totalRecords={users.data?.context.totalRecords ?? 0}
        users={users.data?.data ?? []}
      />
      <OrganisationMembershipCreateSheet
        candidates={(candidates.data?.data ?? [])
          .filter((candidate) => Boolean(candidate?.id))
          .map((candidate) => ({
            id: candidate.id,
            title: candidate.displayName || candidate.email || 'Unnamed user',
            email: candidate.email,
            pendingProvisionRole: candidate.pendingProvision?.role,
          }))}
        cohorts={cohorts.data?.data ?? []}
        error={
          createMemberships.error?.message ??
          candidates.error?.message ??
          cohorts.error?.message
        }
        loading={candidates.isPending || cohorts.isPending}
        onOpenChange={setManagerOpen}
        onPageChange={setCandidatePage}
        onSave={(body) =>
          createMemberships.mutate({ params: { organisationId }, body })
        }
        onSearchChange={(query) => {
          setCandidatePage(1);
          setCandidateSearch(query);
        }}
        open={managerOpen}
        page={candidatePage}
        pageSize={PAGE_SIZE}
        pending={createMemberships.isPending}
        search={candidateSearch}
        totalRecords={candidates.data?.context.totalRecords ?? 0}
      />
      <OrganisationUserCreateSheet
        cohorts={cohorts.data?.data ?? []}
        error={createUser.error?.message ?? cohorts.error?.message}
        onOpenChange={setUserCreateOpen}
        onSave={(body) =>
          createUser.mutate({ params: { organisationId }, body })
        }
        open={userCreateOpen}
        pending={createUser.isPending}
      />
    </>
  );
}
