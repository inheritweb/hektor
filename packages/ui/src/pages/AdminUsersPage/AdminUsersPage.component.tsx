import { createTableColumn } from '../../atoms/Table';
import { NavigationLink } from '../../context';
import { buttonVariants } from '../../atoms/Button';
import { Grid } from '../../organisms/Grid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/Select';

export interface AdminUserListItemViewModel {
  createdAt: string;
  displayName: string;
  email?: string;
  id: string;
  identityProviders: readonly string[];
  lastSignInAt?: string;
  membershipCount: number;
  platformRole?: string;
  status: string;
}

export interface AdminUsersPageProps {
  error?: string;
  addUserHref?: string;
  getUserHref?: (user: AdminUserListItemViewModel) => string;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onStatusChange?: (status?: string) => void;
  page: number;
  pageSize: number;
  totalRecords: number;
  status?: string;
  users: readonly AdminUserListItemViewModel[];
}

function formatDate(value?: string) {
  if (!value) return 'Never';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

const column = createTableColumn<AdminUserListItemViewModel>();

const columns = [
  column.accessor('displayName', {
    className: 'first:pl-3',
    header: 'User',
    cell: ({ row, value }) => (
      <div className="min-w-48">
        <p className="font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">
          {row.email ?? 'No email address'}
        </p>
      </div>
    ),
  }),
  column.accessor('identityProviders', {
    header: 'Sign-in methods',
    cell: ({ value }) => (
      <span className="capitalize">{value.join(', ') || 'None'}</span>
    ),
  }),
  column.accessor('membershipCount', {
    align: 'right',
    header: 'Organisations',
  }),
  column.accessor('lastSignInAt', {
    header: 'Last sign-in',
    cell: ({ value }) => formatDate(value),
  }),
  column.accessor('createdAt', {
    header: 'Joined',
    cell: ({ value }) => formatDate(value),
  }),
  column.accessor('platformRole', {
    header: 'Access',
    cell: ({ value }) =>
      value === 'admin' ? (
        <span className="inline-flex bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
          Admin
        </span>
      ) : (
        <span className="text-muted-foreground">Personal</span>
      ),
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ value }) => <span className="capitalize">{value}</span>,
  }),
];

export function AdminUsersPage({
  addUserHref,
  error,
  getUserHref,
  loading,
  onPageChange,
  onStatusChange,
  page,
  pageSize,
  totalRecords,
  status,
  users,
}: AdminUsersPageProps) {
  const linkedColumns = getUserHref
    ? [
        ...columns,
        column.display('actions', {
          align: 'right',
          className: 'last:pr-3',
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
      {addUserHref || onStatusChange ? (
        <div className="flex items-center justify-between gap-3">
          {onStatusChange ? (
            <Select
              onValueChange={(value) =>
                onStatusChange(!value || value === 'all' ? undefined : value)
              }
              value={status ?? 'all'}
            >
              <SelectTrigger className="w-40">
                <SelectValue>
                  {status === 'active'
                    ? 'Active'
                    : status === 'suspended'
                      ? 'Suspended'
                      : 'All statuses'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span />
          )}
          {addUserHref ? (
            <NavigationLink className={buttonVariants()} href={addUserHref}>
              Add user
            </NavigationLink>
          ) : null}
        </div>
      ) : null}
      <Grid
        caption="Platform users"
        columns={linkedColumns}
        empty="No users have signed up yet."
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
