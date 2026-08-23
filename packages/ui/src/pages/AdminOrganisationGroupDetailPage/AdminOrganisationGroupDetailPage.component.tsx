import { Button, buttonVariants } from '../../atoms/Button';
import { createTableColumn, Table } from '../../atoms/Table';
import { NavigationLink } from '../../context';

export interface GroupUser {
  id: string;
  role: string;
  status: string;
  user: { id: string; displayName: string; email?: string };
}

export interface ProvisionedUser {
  id: string;
  provisioningMethod: string;
  provisionedDisplayName?: string;
  provisionedRole: string;
  provisionedUserName: string;
  status: string;
}

export interface AdminOrganisationGroupDetailViewModel {
  cohort?: { name: string };
  name: string;
  provisioningMethod?: string;
  provisionedUsers: readonly ProvisionedUser[];
  sourceExternalId?: string;
  status: string;
  users: readonly GroupUser[];
}

export interface AdminOrganisationGroupDetailPageProps {
  editHref?: string;
  getProvisionHref?: (provision: ProvisionedUser) => string;
  getUserHref?: (membership: GroupUser) => string;
  group: AdminOrganisationGroupDetailViewModel;
  onManageProvisions?: () => void;
  onManageUsers?: () => void;
}

const userColumn = createTableColumn<GroupUser>();

const provisionColumn = createTableColumn<ProvisionedUser>();

const userColumns = [
  userColumn.accessor('user', {
    header: 'User',
    cell: ({ value }) => (
      <div>
        <p className="font-semibold">{value.displayName}</p>
        {value.email ? (
          <p className="text-xs text-muted-foreground">{value.email}</p>
        ) : null}
      </div>
    ),
  }),
  userColumn.accessor('role', {
    header: 'Role',
    cell: ({ value }) => (
      <span className="capitalize">{value.replaceAll('_', ' ')}</span>
    ),
  }),
  userColumn.accessor('status', {
    header: 'Status',
    cell: ({ value }) => <span className="capitalize">{value}</span>,
  }),
];

const provisionColumns = [
  provisionColumn.accessor('provisionedUserName', {
    header: 'Provisioned user',
    cell: ({ row, value }) => (
      <div>
        <p className="font-semibold">{row.provisionedDisplayName ?? value}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    ),
  }),
  provisionColumn.accessor('provisionedRole', {
    header: 'Role',
    cell: ({ value }) => (
      <span className="capitalize">{value.replaceAll('_', ' ')}</span>
    ),
  }),
  provisionColumn.accessor('status', {
    header: 'Status',
    cell: ({ value }) => <span className="capitalize">{value}</span>,
  }),
  provisionColumn.accessor('provisioningMethod', {
    header: 'Source',
    cell: ({ value }) => <span className="uppercase">{value}</span>,
  }),
];

export function AdminOrganisationGroupDetailPage({
  editHref,
  getProvisionHref,
  getUserHref,
  group,
  onManageProvisions,
  onManageUsers,
}: AdminOrganisationGroupDetailPageProps) {
  const membershipManaged =
    group.status === 'active' && !group.provisioningMethod;
  const linkedUserColumns = getUserHref
    ? [
        ...userColumns,
        userColumn.display('actions', {
          align: 'right',
          header: <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <NavigationLink
              className="font-semibold text-primary hover:underline"
              href={getUserHref(row)}
            >
              View
            </NavigationLink>
          ),
        }),
      ]
    : userColumns;
  const resolvedProvisionColumns = getProvisionHref
    ? [
        ...provisionColumns,
        provisionColumn.display('actions', {
          align: 'right',
          header: <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <NavigationLink
              className="font-semibold text-primary hover:underline"
              href={getProvisionHref(row)}
            >
              View
            </NavigationLink>
          ),
        }),
      ]
    : provisionColumns;
  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-semibold text-primary">Group</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <span className="bg-primary/10 px-2 py-1 text-xs font-semibold capitalize text-primary">
            {group.status}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Managed by {group.provisioningMethod?.toUpperCase() ?? 'Hektor'}
          {group.cohort ? ` · ${group.cohort.name}` : ''}
          {group.sourceExternalId ? ` · ${group.sourceExternalId}` : ''}
        </p>
        {editHref ? (
          <div className="mt-5">
            <NavigationLink
              className={buttonVariants({ variant: 'outline' })}
              href={editHref}
            >
              Edit group
            </NavigationLink>
          </div>
        ) : null}
      </header>
      {membershipManaged ? (
        <section>
          <div>
            <h2 className="text-xl font-bold">Manage membership</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add an organisation user or an unresolved provision to this group.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {onManageUsers ? (
              <Button onClick={onManageUsers}>Manage users</Button>
            ) : null}
            {onManageProvisions ? (
              <Button onClick={onManageProvisions} variant="outline">
                Manage provisions
              </Button>
            ) : null}
          </div>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          {group.status === 'archived'
            ? 'Reactivate this group before changing its membership.'
            : 'Membership is controlled by the external provisioning source.'}
        </p>
      )}
      <section>
        <h2 className="text-xl font-bold">
          Users{' '}
          <span className="text-sm font-normal text-muted-foreground">
            {group.users.length}
          </span>
        </h2>
        {group.users.length ? (
          <Table
            caption={`Users in ${group.name}`}
            className="mt-4"
            columns={linkedUserColumns}
            getRowId={(item) => item.id}
            highlight
            rows={group.users}
          />
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            This group has no linked users.
          </p>
        )}
      </section>
      <section>
        <h2 className="text-xl font-bold">
          Provisioned users{' '}
          <span className="text-sm font-normal text-muted-foreground">
            {group.provisionedUsers.length}
          </span>
        </h2>
        {group.provisionedUsers.length ? (
          <Table
            caption={`Provisioned users in ${group.name}`}
            className="mt-4"
            columns={resolvedProvisionColumns}
            getRowId={(item) => item.id}
            highlight
            rows={group.provisionedUsers}
          />
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            This group has no unresolved provisioned users.
          </p>
        )}
      </section>
    </div>
  );
}
