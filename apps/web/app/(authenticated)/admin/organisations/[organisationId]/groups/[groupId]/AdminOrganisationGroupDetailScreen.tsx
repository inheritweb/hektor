'use client';

import { useDeferredValue, useState } from 'react';

import {
  useAdminGetOrganisationGroup,
  useAdminGetOrganisationUserProvisions,
  useAdminGetOrganisationUsers,
  useAdminUpdateOrganisationGroupMembership,
} from '@hektor/query/organisations';
import { ProvisioningStatus } from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';
import { MembershipManagerSheet } from '@hektor/ui/organisms';
import { AdminOrganisationGroupDetailPage } from '@hektor/ui/pages';

const PAGE_SIZE = 20;

export function AdminOrganisationGroupDetailScreen({
  groupId,
  organisationId,
}: {
  groupId: string;
  organisationId: string;
}) {
  const [userManagerOpen, setUserManagerOpen] = useState(false);
  const [provisionManagerOpen, setProvisionManagerOpen] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [provisionPage, setProvisionPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [provisionSearch, setProvisionSearch] = useState('');
  const deferredUserSearch = useDeferredValue(userSearch.trim());
  const deferredProvisionSearch = useDeferredValue(provisionSearch.trim());
  const group = useAdminGetOrganisationGroup({
    params: { groupId, organisationId },
  });
  const users = useAdminGetOrganisationUsers(
    {
      params: { organisationId },
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
  const provisions = useAdminGetOrganisationUserProvisions(
    {
      params: { organisationId },
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
  const userMembership = useAdminUpdateOrganisationGroupMembership({
    onSuccess: () => setUserManagerOpen(false),
  });
  const provisionMembership = useAdminUpdateOrganisationGroupMembership({
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
        editHref={`/admin/organisations/${organisationId}/groups/${groupId}/edit`}
        group={groupData}
        getProvisionHref={(provision) =>
          `/admin/organisations/${organisationId}/provisioned-users/${provision.id}`
        }
        getUserHref={(membership) => `/admin/users/${membership.user.id}`}
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
        description="Choose the organisation users who belong to this group. Changes are staged until you save."
        emptyMessage="No organisation users match this search."
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
            params: { groupId, organisationId },
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
        description="Choose the unresolved provisions assigned to this group. Changes are staged until you save."
        emptyMessage="No pending provisions match this search."
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
            params: { groupId, organisationId },
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
        title="Manage provisions"
        totalRecords={provisions.data?.context.totalRecords ?? 0}
      />
    </>
  );
}
