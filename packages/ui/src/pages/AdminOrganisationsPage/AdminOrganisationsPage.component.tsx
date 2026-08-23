import { createTableColumn } from '../../atoms/Table';
import { Button, buttonVariants } from '../../atoms/Button';
import { NavigationLink } from '../../context';
import { Grid } from '../../organisms/Grid';

export interface AdminOrganisationListItemViewModel {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface AdminOrganisationsPageProps {
  createHref?: string;
  error?: string;
  getOrganisationHref?: (
    organisation: AdminOrganisationListItemViewModel,
  ) => string;
  loading?: boolean;
  archived: boolean;
  onArchivedChange: (archived: boolean) => void;
  onPageChange: (page: number) => void;
  organisations: readonly AdminOrganisationListItemViewModel[];
  page: number;
  pageSize: number;
  totalRecords: number;
}

const column = createTableColumn<AdminOrganisationListItemViewModel>();

const columns = [
  column.accessor('name', {
    className: 'first:pl-3',
    header: 'Organisation',
    cell: ({ value }) => (
      <span className="font-semibold text-foreground">{value}</span>
    ),
  }),
  column.accessor('slug', {
    header: 'Slug',
    cell: ({ value }) => (
      <span className="font-mono text-xs text-muted-foreground">{value}</span>
    ),
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ value }) => (
      <span className="inline-flex bg-primary/10 px-2 py-1 text-xs font-semibold capitalize text-primary">
        {value}
      </span>
    ),
  }),
];

export function AdminOrganisationsPage({
  createHref,
  error,
  getOrganisationHref,
  loading,
  archived,
  onArchivedChange,
  onPageChange,
  organisations,
  page,
  pageSize,
  totalRecords,
}: AdminOrganisationsPageProps) {
  const linkedColumns = getOrganisationHref
    ? [
        ...columns,
        column.display('actions', {
          align: 'right',
          className: 'last:pr-3',
          header: <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <NavigationLink
              className="inline-flex rounded px-2 py-1 font-semibold text-primary hover:bg-accent/20 hover:underline"
              href={getOrganisationHref(row)}
            >
              View
            </NavigationLink>
          ),
        }),
      ]
    : columns;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button
          aria-pressed={archived}
          onClick={() => onArchivedChange(!archived)}
          variant={archived ? 'secondary' : 'outline'}
        >
          Show archived
        </Button>
        {createHref ? (
          <NavigationLink className={buttonVariants()} href={createHref}>
            Add organisation
          </NavigationLink>
        ) : null}
      </div>
      <Grid
        caption="Platform organisations"
        columns={linkedColumns}
        empty={
          archived
            ? 'No organisations have been archived.'
            : 'No current organisations have been created yet.'
        }
        error={error}
        getRowId={(organisation) => organisation.id}
        highlight
        loading={loading}
        pagination={{ page, pageSize, totalRecords, onPageChange }}
        rows={organisations}
        title="Organisations"
      />
    </div>
  );
}
