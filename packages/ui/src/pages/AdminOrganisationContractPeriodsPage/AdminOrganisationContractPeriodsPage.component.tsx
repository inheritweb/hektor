import { createTableColumn } from '../../atoms/Table';
import { buttonVariants } from '../../atoms/Button';
import { NavigationLink } from '../../context';
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
  createHref?: string;
  error?: string;
  loading?: boolean;
  getContractPeriodHref?: (
    contractPeriod: AdminOrganisationContractPeriodListItemViewModel,
  ) => string;
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
  createHref,
  error,
  loading,
  getContractPeriodHref,
  onPageChange,
  organisationName,
  page,
  pageSize,
  totalRecords,
}: AdminOrganisationContractPeriodsPageProps) {
  const linkedColumns = getContractPeriodHref
    ? [
        ...columns,
        column.display('actions', {
          align: 'right',
          className: 'last:pr-3',
          header: <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <NavigationLink
              className="inline-flex rounded px-2 py-1 font-semibold text-primary hover:bg-accent/20 hover:underline"
              href={getContractPeriodHref(row)}
            >
              Edit
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
            Add contract period
          </NavigationLink>
        </div>
      ) : null}
      <Grid
        caption={`Contract periods for ${organisationName}`}
        columns={linkedColumns}
        empty="This organisation has no contract periods."
        error={error}
        getRowId={(contractPeriod) => contractPeriod.id}
        loading={loading}
        pagination={{ page, pageSize, totalRecords, onPageChange }}
        rows={contractPeriods}
        title="Contract periods"
      />
    </div>
  );
}
