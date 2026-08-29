import { LuCalendarRange, LuLayers3, LuUsers } from 'react-icons/lu';

import { createTableColumn, Table } from '../../atoms/Table';
import { buttonVariants } from '../../atoms/Button';
import { NavigationLink } from '../../context';

export interface AdminOrganisationCohortDetailViewModel {
  endsOn: string;
  groups: readonly {
    id: string;
    name: string;
    status: string;
  }[];
  id: string;
  learners: readonly {
    id: string;
    role: string;
    platformStatus: string;
    seatStatus: string;
    status: string;
    user: {
      displayName: string;
      email?: string;
      id: string;
    };
  }[];
  name: string;
  startsOn: string;
  status: string;
}

export interface AdminOrganisationCohortDetailPageProps {
  cohort: AdminOrganisationCohortDetailViewModel;
  editHref?: string;
  getUserHref?: (
    learner: AdminOrganisationCohortDetailViewModel['learners'][number],
  ) => string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

const learnerColumn =
  createTableColumn<
    AdminOrganisationCohortDetailViewModel['learners'][number]
  >();

const learnerColumns = [
  learnerColumn.accessor('user', {
    header: 'Learner',
    cell: ({ value }) => (
      <div>
        <p className="font-semibold">{value.displayName}</p>
        {value.email ? (
          <p className="text-xs text-muted-foreground">{value.email}</p>
        ) : null}
      </div>
    ),
  }),
  learnerColumn.accessor('status', {
    header: 'Membership',
    cell: ({ value }) => <span className="capitalize">{value}</span>,
  }),
  learnerColumn.accessor('platformStatus', {
    header: 'Platform status',
    cell: ({ value }) => (
      <span className="capitalize">{value.replaceAll('_', ' ')}</span>
    ),
  }),
  learnerColumn.accessor('seatStatus', {
    header: 'Organisation seat',
    cell: ({ value }) => (
      <span className="capitalize">{value.replaceAll('_', ' ')}</span>
    ),
  }),
];

export function AdminOrganisationCohortDetailPage({
  cohort,
  editHref,
  getUserHref,
}: AdminOrganisationCohortDetailPageProps) {
  const columns = getUserHref
    ? [
        ...learnerColumns,
        learnerColumn.display('actions', {
          align: 'right',
          header: <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <NavigationLink
              className="inline-flex rounded px-2 py-1 font-semibold text-primary hover:bg-accent/20 hover:underline"
              href={getUserHref(row)}
            >
              View
            </NavigationLink>
          ),
        }),
      ]
    : learnerColumns;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Cohort</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{cohort.name}</h1>
            <span className="bg-primary/10 px-2 py-1 text-xs font-semibold capitalize text-primary">
              {cohort.status}
            </span>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <LuCalendarRange aria-hidden="true" />
            {formatDate(cohort.startsOn)}–{formatDate(cohort.endsOn)}
          </p>
        </div>
        {editHref ? (
          <NavigationLink
            className={buttonVariants({ variant: 'outline' })}
            href={editHref}
          >
            Edit cohort
          </NavigationLink>
        ) : null}
      </header>

      <section aria-labelledby="cohort-groups-heading">
        <div className="flex items-center gap-2">
          <LuLayers3 aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-bold" id="cohort-groups-heading">
            Groups
          </h2>
        </div>
        {cohort.groups.length ? (
          <div className="mt-4 grid gap-px bg-border sm:grid-cols-2">
            {cohort.groups.map((group) => (
              <article className="bg-paper px-4 py-3" key={group.id}>
                <p className="font-semibold">{group.name}</p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {group.status}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            This cohort has no groups.
          </p>
        )}
      </section>

      <section aria-labelledby="cohort-learners-heading">
        <div className="flex items-center gap-2">
          <LuUsers aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-bold" id="cohort-learners-heading">
            Learners
          </h2>
          <span className="text-sm text-muted-foreground">
            {cohort.learners.length}
          </span>
        </div>
        {cohort.learners.length ? (
          <Table
            caption={`Learners in ${cohort.name}`}
            className="mt-4"
            columns={columns}
            getRowId={(learner) => learner.id}
            highlight
            rows={cohort.learners}
          />
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            This cohort has no learners.
          </p>
        )}
      </section>
    </div>
  );
}
