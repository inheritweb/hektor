import { createTableColumn } from '../../atoms/Table';
import { Grid } from '../../organisms/Grid';

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
  loading?: boolean;
  onPageChange: (page: number) => void;
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
  loading,
  onPageChange,
  organisationName,
  page,
  pageSize,
  totalRecords,
  users,
}: AdminOrganisationUsersPageProps) {
  return (
    <Grid
      caption={`Users in ${organisationName}`}
      columns={columns}
      empty="This organisation has no users."
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
