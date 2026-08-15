import { createTableColumn } from '../../atoms/Table';
import { Grid } from '../../organisms/Grid';

export interface AdminUserListItemViewModel {
  createdAt: string;
  displayName: string;
  email?: string;
  id: string;
  identityProviders: readonly string[];
  lastSignInAt?: string;
  membershipCount: number;
  platformRole?: string;
}

export interface AdminUsersPageProps {
  error?: string;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onUserSelect?: (user: AdminUserListItemViewModel) => void;
  page: number;
  pageSize: number;
  totalRecords: number;
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
];

export function AdminUsersPage({
  error,
  loading,
  onPageChange,
  onUserSelect,
  page,
  pageSize,
  totalRecords,
  users,
}: AdminUsersPageProps) {
  const selectableColumns = onUserSelect
    ? [
        ...columns,
        column.display('actions', {
          align: 'right',
          header: <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <button
              className="font-semibold text-primary hover:underline"
              onClick={() => onUserSelect(row)}
              type="button"
            >
              View
            </button>
          ),
        }),
      ]
    : columns;

  return (
    <Grid
      caption="Platform users"
      columns={selectableColumns}
      empty="No users have signed up yet."
      error={error}
      getRowId={(user) => user.id}
      highlight
      loading={loading}
      pagination={{ page, pageSize, totalRecords, onPageChange }}
      rows={users}
      title="Users"
    />
  );
}
