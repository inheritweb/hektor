import type { IconType } from 'react-icons';
import { LuGraduationCap, LuLayers3, LuUsers } from 'react-icons/lu';

import { buttonVariants } from '../../atoms';
import { NavigationLink } from '../../context';

interface OrganisationDashboardPageProps {
  cohortCount: number;
  error?: string;
  groupCount: number;
  loading?: boolean;
  organisationName: string;
  provisionCount: number;
  userCount: number;
}

function Section({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  description: string;
  icon: IconType;
  title: string;
}) {
  return (
    <section className="border-t border-border pt-6 first:border-0 first:pt-0">
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

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-paper px-4 py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value.toLocaleString('en-GB')}</p>
    </div>
  );
}

export function OrganisationDashboardPage({
  cohortCount,
  error,
  groupCount,
  loading,
  organisationName,
  provisionCount,
  userCount,
}: OrganisationDashboardPageProps) {
  if (error)
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  if (loading)
    return (
      <div
        aria-label="Loading organisation dashboard"
        className="h-96 animate-pulse bg-accent/40"
      />
    );

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-semibold text-primary">
          Organisation workspace
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {organisationName}
        </h1>
      </header>
      <Section
        description="Connected users, reserved places and invitations."
        icon={LuUsers}
        title="Users"
      >
        <div className="grid gap-px bg-border sm:grid-cols-2">
          <Count label="Connected users" value={userCount} />
          <Count label="Provisions" value={provisionCount} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <NavigationLink
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
            href="/users"
          >
            View users
          </NavigationLink>
          <NavigationLink
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
            href="/users/provisions"
          >
            Manage provisions
          </NavigationLink>
        </div>
      </Section>
      <Section
        description="Programme intakes belonging to this organisation."
        icon={LuGraduationCap}
        title="Cohorts"
      >
        <Count label="Cohorts" value={cohortCount} />
        <NavigationLink
          className={`${buttonVariants({ size: 'sm', variant: 'outline' })} mt-5`}
          href="/cohorts"
        >
          View cohorts
        </NavigationLink>
      </Section>
      <Section
        description="Local and externally provisioned teaching and study groups."
        icon={LuLayers3}
        title="Groups"
      >
        <Count label="Groups" value={groupCount} />
        <NavigationLink
          className={`${buttonVariants({ size: 'sm', variant: 'outline' })} mt-5`}
          href="/groups"
        >
          View groups
        </NavigationLink>
      </Section>
    </div>
  );
}
