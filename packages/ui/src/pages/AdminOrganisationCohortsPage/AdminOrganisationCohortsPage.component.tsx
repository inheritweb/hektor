import { createTableColumn } from '../../atoms/Table';
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
  loading,
  onPageChange,
  organisationName,
  page,
  pageSize,
  totalRecords,
}: AdminOrganisationCohortsPageProps) {
  return (
    <Grid
      caption={`Cohorts for ${organisationName}`}
      columns={columns}
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
