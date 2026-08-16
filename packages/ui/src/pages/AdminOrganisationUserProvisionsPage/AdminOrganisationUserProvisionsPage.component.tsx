import { createTableColumn } from '../../atoms/Table';
import { Grid } from '../../organisms/Grid';

export interface AdminOrganisationUserProvisionListItemViewModel {
  id: string;
  provisionedDisplayName?: string;
  provisionedRole: string;
  provisionedUserName: string;
  provisioningMethod: string;
  status: string;
}

export interface AdminOrganisationUserProvisionsPageProps {
  error?: string;
  loading?: boolean;
  onPageChange: (page: number) => void;
  organisationName: string;
  page: number;
  pageSize: number;
  provisions: readonly AdminOrganisationUserProvisionListItemViewModel[];
  totalRecords: number;
}

function readable(value: string) {
  return value.replaceAll('_', ' ');
}

const column =
  createTableColumn<AdminOrganisationUserProvisionListItemViewModel>();

const columns = [
  column.accessor('provisionedDisplayName', {
    className: 'first:pl-3',
    header: 'Provisioned user',
    cell: ({ row, value }) => (
      <div className="min-w-48">
        <p className="font-semibold text-foreground">
          {value ?? row.provisionedUserName}
        </p>
        {value ? (
          <p className="text-xs text-muted-foreground">
            {row.provisionedUserName}
          </p>
        ) : null}
      </div>
    ),
  }),
  column.accessor('provisionedRole', {
    header: 'Role',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
  column.accessor('provisioningMethod', {
    header: 'Method',
    cell: ({ value }) => <span className="uppercase">{value}</span>,
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
];

export function AdminOrganisationUserProvisionsPage({
  error,
  loading,
  onPageChange,
  organisationName,
  page,
  pageSize,
  provisions,
  totalRecords,
}: AdminOrganisationUserProvisionsPageProps) {
  return (
    <Grid
      caption={`Provisioned users in ${organisationName}`}
      columns={columns}
      empty="This organisation has no provisioned users."
      error={error}
      getRowId={(provision) => provision.id}
      highlight
      loading={loading}
      pagination={{ page, pageSize, totalRecords, onPageChange }}
      rows={provisions}
      title="Provisioned users"
    />
  );
}
