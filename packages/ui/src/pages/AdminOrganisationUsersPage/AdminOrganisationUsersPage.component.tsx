import { createTableColumn } from '../../atoms/Table';
import { Grid } from '../../organisms/Grid';
import { NavigationLink } from '../../context';
import { Button } from '../../atoms/Button';

export interface AdminOrganisationUserListItemViewModel {
  id: string;
  role: string;
  status: string;
  user: {
    displayName: string;
    email?: string;
  };
}

export interface AdminOrganisationUsersPageProps {
  error?: string;
  getUserHref?: (user: AdminOrganisationUserListItemViewModel) => string;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onConnectUsers?: () => void;
  onAddUser?: () => void;
  organisationName: string;
  page: number;
  pageSize: number;
  totalRecords: number;
  users: readonly AdminOrganisationUserListItemViewModel[];
}

function readable(value: string) {
  return value.replaceAll('_', ' ');
}

const column = createTableColumn<AdminOrganisationUserListItemViewModel>();

const columns = [
  column.accessor('user', {
    className: 'first:pl-3',
    header: 'User',
    cell: ({ value }) => (
      <div className="min-w-48">
        <p className="font-semibold text-foreground">{value.displayName}</p>
        {value.email ? (
          <p className="text-xs text-muted-foreground">{value.email}</p>
        ) : null}
      </div>
    ),
  }),
  column.accessor('role', {
    header: 'Role',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
];

export function AdminOrganisationUsersPage({
  error,
  getUserHref,
  loading,
  onPageChange,
  onConnectUsers,
  onAddUser,
  organisationName,
  page,
  pageSize,
  totalRecords,
  users,
}: AdminOrganisationUsersPageProps) {
  const linkedColumns = getUserHref
    ? [
        ...columns,
        column.display('actions', {
          align: 'right',
          header: <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <NavigationLink
              className="inline-flex rounded px-2 py-1 font-semibold text-primary hover:bg-accent/20 hover:underline"
              href={getUserHref(row)}
            >
              View
            </NavigationLink>
          ),
        }),
      ]
    : columns;
  return (
    <div className="space-y-4">
      {onConnectUsers || onAddUser ? (
        <div className="flex justify-end gap-2">
          {onAddUser ? (
            <Button onClick={onAddUser} variant="outline">
              Add user
            </Button>
          ) : null}
          {onConnectUsers ? (
            <Button onClick={onConnectUsers}>Connect users</Button>
          ) : null}
        </div>
      ) : null}
      <Grid
        caption={`Users in ${organisationName}`}
        columns={linkedColumns}
        empty="This organisation has no users."
        error={error}
        getRowId={(user) => user.id}
        highlight
        loading={loading}
        pagination={{ page, pageSize, totalRecords, onPageChange }}
        rows={users}
        title="Users"
      />
    </div>
  );
}
