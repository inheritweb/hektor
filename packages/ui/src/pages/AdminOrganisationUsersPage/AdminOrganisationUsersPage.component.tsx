import { createTableColumn } from '../../atoms/Table';
import { Grid } from '../../organisms/Grid';
import {
  OrganisationDetailsRail,
  type OrganisationDetailsRailViewModel,
} from '../../organisms/OrganisationDetailsRail';

export interface AdminOrganisationUserListItemViewModel {
  displayName?: string;
  id: string;
  linked: boolean;
  role: string;
  scimStatus: string;
  status: string;
  userName: string;
}

export interface AdminOrganisationUsersPageProps {
  error?: string;
  loading?: boolean;
  onPageChange: (page: number) => void;
  organisation?: OrganisationDetailsRailViewModel;
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
  column.accessor('displayName', {
    className: 'first:pl-3',
    header: 'User',
    cell: ({ row, value }) => (
      <div className="min-w-48">
        <p className="font-semibold text-foreground">{value ?? row.userName}</p>
        {value ? (
          <p className="text-xs text-muted-foreground">{row.userName}</p>
        ) : null}
      </div>
    ),
  }),
  column.accessor('role', {
    header: 'Role',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
  column.accessor('linked', {
    header: 'Account',
    cell: ({ value }) =>
      value ? (
        <span>Linked</span>
      ) : (
        <span className="text-muted-foreground">Awaiting account linking</span>
      ),
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
  column.accessor('scimStatus', {
    header: 'Provisioning',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
];

export function AdminOrganisationUsersPage({
  error,
  loading,
  onPageChange,
  organisation,
  page,
  pageSize,
  totalRecords,
  users,
}: AdminOrganisationUsersPageProps) {
  const organisationName = organisation?.name ?? 'Organisation';

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)] lg:gap-14">
      {organisation ? (
        <OrganisationDetailsRail headingLevel={2} organisation={organisation} />
      ) : (
        <div aria-label="Loading organisation" className="space-y-4">
          <div className="h-16 animate-pulse bg-accent/70" />
          <div className="h-40 animate-pulse bg-accent/50" />
        </div>
      )}
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
    </div>
  );
}
