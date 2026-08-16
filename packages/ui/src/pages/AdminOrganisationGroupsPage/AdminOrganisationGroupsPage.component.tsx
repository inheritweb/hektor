import { createTableColumn } from '../../atoms/Table';
import { Grid } from '../../organisms/Grid';

export interface AdminOrganisationGroupListItemViewModel {
  id: string;
  name: string;
  provisioningMethod?: string;
  sourceExternalId?: string;
  status: string;
}

export interface AdminOrganisationGroupsPageProps {
  error?: string;
  groups: readonly AdminOrganisationGroupListItemViewModel[];
  loading?: boolean;
  onPageChange: (page: number) => void;
  organisationName: string;
  page: number;
  pageSize: number;
  totalRecords: number;
}

const column = createTableColumn<AdminOrganisationGroupListItemViewModel>();

const columns = [
  column.accessor('name', {
    className: 'first:pl-3',
    header: 'Group',
    cell: ({ value }) => <span className="font-semibold">{value}</span>,
  }),
  column.accessor('provisioningMethod', {
    header: 'Managed by',
    cell: ({ value }) => (
      <span className="capitalize">{value ?? 'Hektor'}</span>
    ),
  }),
  column.accessor('sourceExternalId', {
    header: 'Source ID',
    cell: ({ value }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {value ?? '—'}
      </span>
    ),
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ value }) => <span className="capitalize">{value}</span>,
  }),
];

export function AdminOrganisationGroupsPage({
  error,
  groups,
  loading,
  onPageChange,
  organisationName,
  page,
  pageSize,
  totalRecords,
}: AdminOrganisationGroupsPageProps) {
  return (
    <Grid
      caption={`Groups for ${organisationName}`}
      columns={columns}
      empty="This organisation has no groups."
      error={error}
      getRowId={(group) => group.id}
      highlight
      loading={loading}
      pagination={{ page, pageSize, totalRecords, onPageChange }}
      rows={groups}
      title="Groups"
    />
  );
}
