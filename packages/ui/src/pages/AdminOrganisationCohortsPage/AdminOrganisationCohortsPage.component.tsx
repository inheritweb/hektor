import { createTableColumn } from '../../atoms/Table';
import { NavigationLink } from '../../context';
import { Grid } from '../../organisms/Grid';

export interface AdminOrganisationCohortListItemViewModel {
  endsOn: string;
  id: string;
  name: string;
  startsOn: string;
  status: string;
}

export interface AdminOrganisationCohortsPageProps {
  cohorts: readonly AdminOrganisationCohortListItemViewModel[];
  error?: string;
  getCohortHref?: (cohort: AdminOrganisationCohortListItemViewModel) => string;
  loading?: boolean;
  onPageChange: (page: number) => void;
  organisationName: string;
  page: number;
  pageSize: number;
  totalRecords: number;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

const column = createTableColumn<AdminOrganisationCohortListItemViewModel>();

const columns = [
  column.accessor('name', {
    className: 'first:pl-3',
    header: 'Cohort',
    cell: ({ value }) => <span className="font-semibold">{value}</span>,
  }),
  column.accessor('startsOn', {
    header: 'Starts',
    cell: ({ value }) => formatDate(value),
  }),
  column.accessor('endsOn', {
    header: 'Ends',
    cell: ({ value }) => formatDate(value),
  }),
  column.accessor('status', {
    header: 'Status',
    cell: ({ value }) => <span className="capitalize">{value}</span>,
  }),
];

export function AdminOrganisationCohortsPage({
  cohorts,
  error,
  getCohortHref,
  loading,
  onPageChange,
  organisationName,
  page,
  pageSize,
  totalRecords,
}: AdminOrganisationCohortsPageProps) {
  const linkedColumns = getCohortHref
    ? [
        ...columns,
        column.display('actions', {
          align: 'right',
          className: 'last:pr-3',
          header: <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <NavigationLink
              className="inline-flex rounded px-2 py-1 font-semibold text-primary hover:bg-accent/20 hover:underline"
              href={getCohortHref(row)}
            >
              View
            </NavigationLink>
          ),
        }),
      ]
    : columns;

  return (
    <Grid
      caption={`Cohorts for ${organisationName}`}
      columns={linkedColumns}
      empty="This organisation has no cohorts."
      error={error}
      getRowId={(cohort) => cohort.id}
      highlight
      loading={loading}
      pagination={{ page, pageSize, totalRecords, onPageChange }}
      rows={cohorts}
      title="Cohorts"
    />
  );
}
