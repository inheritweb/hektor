import { createTableColumn } from '../../atoms/Table';
import { Grid } from '../../organisms/Grid';

export interface AdminOrganisationContractPeriodListItemViewModel {
  id: string;
  startsOn: string;
  endsOn: string;
  seats: {
    allowed: number;
    activated: number;
    remaining: number;
  };
}

export interface AdminOrganisationContractPeriodsPageProps {
  contractPeriods: readonly AdminOrganisationContractPeriodListItemViewModel[];
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

const column =
  createTableColumn<AdminOrganisationContractPeriodListItemViewModel>();

const columns = [
  column.accessor('startsOn', {
    className: 'first:pl-3',
    header: 'Starts',
    cell: ({ value }) => formatDate(value),
  }),
  column.accessor('endsOn', {
    header: 'Ends',
    cell: ({ value }) => formatDate(value),
  }),
  column.accessor('seats', {
    header: 'Learner seats',
    id: 'seat-usage',
    cell: ({ value }) => `${value.activated} of ${value.allowed} activated`,
  }),
  column.accessor('seats', {
    header: 'Remaining',
    id: 'seats-remaining',
    cell: ({ value }) => value.remaining,
  }),
];

export function AdminOrganisationContractPeriodsPage({
  contractPeriods,
  error,
  loading,
  onPageChange,
  organisationName,
  page,
  pageSize,
  totalRecords,
}: AdminOrganisationContractPeriodsPageProps) {
  return (
    <Grid
      caption={`Contract periods for ${organisationName}`}
      columns={columns}
      empty="This organisation has no contract periods."
      error={error}
      getRowId={(contractPeriod) => contractPeriod.id}
      loading={loading}
      pagination={{ page, pageSize, totalRecords, onPageChange }}
      rows={contractPeriods}
      title="Contract periods"
    />
  );
}
