'use client';

import { useDeferredValue, useState } from 'react';

import {
  useGetOrganisationGroup,
  useGetOrganisationUserProvisions,
  useGetOrganisationUsers,
  useUpdateOrganisationGroupMembership,
} from '@hektor/query/organisations';
import { ProvisioningStatus } from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';
import { MembershipManagerSheet } from '@hektor/ui/organisms';
import { AdminOrganisationGroupDetailPage } from '@hektor/ui/pages';

const PAGE_SIZE = 20;

export function OrganisationGroupDetailScreen({
  groupId,
}: {
  groupId: string;
}) {
  const [userManagerOpen, setUserManagerOpen] = useState(false);
  const [provisionManagerOpen, setProvisionManagerOpen] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [provisionPage, setProvisionPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [provisionSearch, setProvisionSearch] = useState('');
  const deferredUserSearch = useDeferredValue(userSearch.trim());
  const deferredProvisionSearch = useDeferredValue(provisionSearch.trim());
  const group = useGetOrganisationGroup({ params: { groupId } });
  const users = useGetOrganisationUsers(
    {
      query: {
        dir: SortDirection.Ascending,
        order: 'displayName',
        page: userPage,
        pageSize: PAGE_SIZE,
        query: deferredUserSearch || undefined,
      },
    },
    { enabled: userManagerOpen },
  );
  const provisions = useGetOrganisationUserProvisions(
    {
      query: {
        dir: SortDirection.Ascending,
        order: 'displayName',
        page: provisionPage,
        pageSize: PAGE_SIZE,
        query: deferredProvisionSearch || undefined,
        status: ProvisioningStatus.Pending,
      },
    },
    { enabled: provisionManagerOpen },
  );
  const userMembership = useUpdateOrganisationGroupMembership({
    onSuccess: () => setUserManagerOpen(false),
  });
  const provisionMembership = useUpdateOrganisationGroupMembership({
    onSuccess: () => setProvisionManagerOpen(false),
  });

  if (group.isPending) {
    return (
      <div
        aria-label="Loading group"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  }

  if (group.isError) {
    return (
      <section>
        <h1 className="text-2xl font-bold">
          We couldn&apos;t load this group.
        </h1>
        <p className="mt-2 text-muted-foreground">{group.error.message}</p>
      </section>
    );
  }

  const groupData = group.data.data;

  return (
    <>
      <AdminOrganisationGroupDetailPage
        editHref={`/groups/${groupId}/edit`}
        getUserHref={(membership) => `/users/${membership.id}`}
        group={groupData}
        onManageProvisions={() => {
          setProvisionPage(1);
          setProvisionSearch('');
          setProvisionManagerOpen(true);
        }}
        onManageUsers={() => {
          setUserPage(1);
          setUserSearch('');
          setUserManagerOpen(true);
        }}
      />

      <MembershipManagerSheet
        currentMemberIds={groupData.users.map((membership) => membership.id)}
        description="Choose users already connected to this organisation. Changes are staged until you save."
        emptyMessage="No connected organisation users match this search."
        error={userMembership.error?.message ?? users.error?.message}
        items={(users.data?.data ?? []).map((membership) => ({
          detail: `${membership.role.replaceAll('_', ' ')} · ${membership.status}`,
          id: membership.id,
          subtitle: membership.user.email,
          title: membership.user.displayName,
        }))}
        loading={users.isPending}
        onOpenChange={setUserManagerOpen}
        onPageChange={setUserPage}
        onSave={({ addIds, removeIds }) =>
          userMembership.mutate({
            params: { groupId },
            body: {
              addProvisionIds: [],
              addUserIds: addIds,
              removeProvisionIds: [],
              removeUserIds: removeIds,
            },
          })
        }
        onSearchChange={(query) => {
          setUserPage(1);
          setUserSearch(query);
        }}
        open={userManagerOpen}
        page={userPage}
        pageSize={PAGE_SIZE}
        pending={userMembership.isPending}
        search={userSearch}
        title="Manage users"
        totalRecords={users.data?.context.totalRecords ?? 0}
      />

      <MembershipManagerSheet
        currentMemberIds={groupData.provisionedUsers.map(
          (provision) => provision.id,
        )}
        description="Choose pending provisioned users in this organisation. Changes are staged until you save."
        emptyMessage="No pending provisioned users match this search."
        error={provisionMembership.error?.message ?? provisions.error?.message}
        items={(provisions.data?.data ?? []).map((provision) => ({
          detail: `${provision.provisionedRole.replaceAll('_', ' ')} · ${provision.provisioningMethod}`,
          id: provision.id,
          subtitle: provision.provisionedUserName,
          title:
            provision.provisionedDisplayName ?? provision.provisionedUserName,
        }))}
        loading={provisions.isPending}
        onOpenChange={setProvisionManagerOpen}
        onPageChange={setProvisionPage}
        onSave={({ addIds, removeIds }) =>
          provisionMembership.mutate({
            params: { groupId },
            body: {
              addProvisionIds: addIds,
              addUserIds: [],
              removeProvisionIds: removeIds,
              removeUserIds: [],
            },
          })
        }
        onSearchChange={(query) => {
          setProvisionPage(1);
          setProvisionSearch(query);
        }}
        open={provisionManagerOpen}
        page={provisionPage}
        pageSize={PAGE_SIZE}
        pending={provisionMembership.isPending}
        search={provisionSearch}
        title="Manage provisioned users"
        totalRecords={provisions.data?.context.totalRecords ?? 0}
      />
    </>
  );
}
