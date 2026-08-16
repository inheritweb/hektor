import type { ReactNode } from 'react';
import {
  LuCalendarRange,
  LuGraduationCap,
  LuLayers3,
  LuUserRoundPlus,
  LuUsers,
} from 'react-icons/lu';

import { buttonVariants } from '../../atoms/Button';
import { NavigationLink } from '../../context';

export interface AdminOrganisationContractPeriodViewModel {
  endsOn: string;
  id: string;
  seats: {
    activated: number;
    allowed: number;
    remaining: number;
  };
  startsOn: string;
}

export interface AdminOrganisationCohortViewModel {
  endsOn: string;
  id: string;
  name: string;
  startsOn: string;
  status: string;
}

export interface AdminOrganisationGroupViewModel {
  id: string;
  name: string;
  status: string;
}

export interface AdminOrganisationDetailViewModel {
  cohorts: readonly AdminOrganisationCohortViewModel[];
  contractPeriods: readonly AdminOrganisationContractPeriodViewModel[];
  createdAt: string;
  groups: readonly AdminOrganisationGroupViewModel[];
  id: string;
  name: string;
  slug: string;
  status: string;
  updatedAt: string;
  usersSummary: {
    learners: number;
    organisationAdmins: number;
    suspended: number;
    total: number;
    tutors: number;
  };
  userProvisionsSummary: {
    failed: number;
    inactive: number;
    pending: number;
    total: number;
  };
}

export interface AdminOrganisationDetailPageProps {
  cohortsHref: string;
  contractPeriodsHref: string;
  organisation: AdminOrganisationDetailViewModel;
  provisionsHref: string;
  usersHref: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function readable(value: string) {
  return value.replaceAll('_', ' ');
}

function CollectionSection({
  children,
  description,
  icon: Icon,
  separated = true,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: typeof LuUsers;
  separated?: boolean;
  title: string;
}) {
  return (
    <section className={separated ? 'border-t border-border pt-6' : undefined}>
      <header className="mb-5 flex items-start gap-3">
        <Icon aria-hidden="true" className="mt-0.5 size-5 text-primary" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

export function AdminOrganisationDetailPage({
  cohortsHref,
  contractPeriodsHref,
  organisation,
  provisionsHref,
  usersHref,
}: AdminOrganisationDetailPageProps) {
  const users = organisation.usersSummary;
  const provisions = organisation.userProvisionsSummary;

  return (
    <div className="space-y-10">
      <CollectionSection
        description="Users and roles within this organisation."
        icon={LuUsers}
        separated={false}
        title="Users"
      >
        <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total users', users.total],
            ['Suspended', users.suspended],
            ['Learners', users.learners],
            ['Tutors', users.tutors],
            ['Organisation admins', users.organisationAdmins],
          ].map(([label, value]) => (
            <div className="bg-paper px-4 py-4" key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <NavigationLink
          className={`${buttonVariants({ size: 'sm', variant: 'outline' })} mt-5`}
          href={usersHref}
        >
          View users
        </NavigationLink>
      </CollectionSection>

      <CollectionSection
        description="Accounts supplied by an organisation that have not necessarily been linked to Hektor users."
        icon={LuUserRoundPlus}
        title="Provisioned users"
      >
        <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total provisions', provisions.total],
            ['Awaiting account linking', provisions.pending],
            ['Inactive', provisions.inactive],
            ['Failed', provisions.failed],
          ].map(([label, value]) => (
            <div className="bg-paper px-4 py-4" key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <NavigationLink
          className={`${buttonVariants({ size: 'sm', variant: 'outline' })} mt-5`}
          href={provisionsHref}
        >
          View provisioned users
        </NavigationLink>
      </CollectionSection>

      <CollectionSection
        description="Commercial periods and learner seat usage."
        icon={LuCalendarRange}
        title="Contract periods"
      >
        {organisation.contractPeriods.length ? (
          <div className="space-y-2">
            {organisation.contractPeriods.map((period) => (
              <article className="bg-accent/20 px-4 py-3" key={period.id}>
                <p className="text-xs font-medium text-muted-foreground">
                  Contract period
                </p>
                <p className="mt-1 font-semibold">
                  {formatDate(period.startsOn)}–{formatDate(period.endsOn)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {period.seats.activated} of {period.seats.allowed} seats
                  activated · {period.seats.remaining} remaining
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No contract periods have been created.
          </p>
        )}
        <NavigationLink
          className={`${buttonVariants({ size: 'sm', variant: 'outline' })} mt-5`}
          href={contractPeriodsHref}
        >
          View contract periods
        </NavigationLink>
      </CollectionSection>

      <CollectionSection
        description="Programme intakes belonging to this organisation."
        icon={LuGraduationCap}
        title="Cohorts"
      >
        {organisation.cohorts.length ? (
          <div className="space-y-2">
            {organisation.cohorts.map((cohort) => (
              <article className="bg-accent/20 px-4 py-3" key={cohort.id}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold">{cohort.name}</h3>
                  <span className="text-xs capitalize text-muted-foreground">
                    {readable(cohort.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(cohort.startsOn)}–{formatDate(cohort.endsOn)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No cohorts have been created.
          </p>
        )}
        <NavigationLink
          className={`${buttonVariants({ size: 'sm', variant: 'outline' })} mt-5`}
          href={cohortsHref}
        >
          View cohorts
        </NavigationLink>
      </CollectionSection>

      <CollectionSection
        description="Teaching and study groups within the organisation."
        icon={LuLayers3}
        title="Groups"
      >
        {organisation.groups.length ? (
          <div className="space-y-2">
            {organisation.groups.map((group) => (
              <article
                className="flex items-center justify-between gap-4 bg-accent/20 px-4 py-3"
                key={group.id}
              >
                <h3 className="font-semibold">{group.name}</h3>
                <span className="text-xs capitalize text-muted-foreground">
                  {readable(group.status)}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No groups have been created.
          </p>
        )}
      </CollectionSection>
    </div>
  );
}
