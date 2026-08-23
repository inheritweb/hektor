import { createTableColumn } from '../../atoms/Table';
import { buttonVariants } from '../../atoms/Button';
import { NavigationLink } from '../../context';
import { Grid } from '../../organisms/Grid';

export interface AdminOrganisationGroupListItemViewModel {
  id: string;
  name: string;
  provisioningMethod?: string;
  sourceExternalId?: string;
  status: string;
}

export interface AdminOrganisationGroupsPageProps {
  createHref?: string;
  error?: string;
  groups: readonly AdminOrganisationGroupListItemViewModel[];
  getGroupHref?: (group: AdminOrganisationGroupListItemViewModel) => string;
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
  createHref,
  error,
  groups,
  getGroupHref,
  loading,
  onPageChange,
  organisationName,
  page,
  pageSize,
  totalRecords,
}: AdminOrganisationGroupsPageProps) {
  const linkedColumns = getGroupHref
    ? [
        ...columns,
        column.display('actions', {
          align: 'right',
          className: 'last:pr-3',
          header: <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <NavigationLink
              className="inline-flex rounded px-2 py-1 font-semibold text-primary hover:bg-accent/20 hover:underline"
              href={getGroupHref(row)}
            >
              View
            </NavigationLink>
          ),
        }),
      ]
    : columns;
  return (
    <div>
      {createHref ? (
        <div className="mb-4 flex justify-end">
          <NavigationLink className={buttonVariants()} href={createHref}>
            Add group
          </NavigationLink>
        </div>
      ) : null}
      <Grid
        caption={`Groups for ${organisationName}`}
        columns={linkedColumns}
        empty="This organisation has no groups."
        error={error}
        getRowId={(group) => group.id}
        highlight
        loading={loading}
        pagination={{ page, pageSize, totalRecords, onPageChange }}
        rows={groups}
        title="Groups"
      />
    </div>
  );
}
