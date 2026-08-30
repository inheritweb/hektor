import type { IconType } from 'react-icons';
import {
  LuGraduationCap,
  LuLayers3,
  LuSettings2,
  LuUserRoundPlus,
  LuUsers,
} from 'react-icons/lu';

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

interface DashboardPodProps {
  description: string;
  href: string;
  icon: IconType;
  label: string;
  value?: number;
}

function DashboardPod({
  description,
  href,
  icon: Icon,
  label,
  value,
}: DashboardPodProps) {
  return (
    <NavigationLink
      className="group flex min-h-40 flex-col bg-paper p-5 shadow-[0_0_18px_-10px_rgb(0_0_0/0.25)] transition hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={href}
    >
      <div className="flex items-center gap-2 text-primary">
        <Icon aria-hidden="true" className="size-4" />
        <h2 className="text-sm font-semibold">{label}</h2>
      </div>
      {value === undefined ? (
        <LuSettings2
          aria-hidden="true"
          className="mt-4 size-9 text-foreground"
        />
      ) : (
        <p className="mt-4 text-4xl font-bold tracking-tight">
          {value.toLocaleString('en-GB')}
        </p>
      )}
      <p className="mt-auto pt-4 text-sm text-muted-foreground">
        {description}
      </p>
    </NavigationLink>
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
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-primary">
          Organisation workspace
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {organisationName}
        </h1>
      </header>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardPod
            description="Review connected users and their organisation access."
            href="/users"
            icon={LuUsers}
            label="Users"
            value={userCount}
          />
          <DashboardPod
            description="Invite users and manage reserved places."
            href="/users/provisions"
            icon={LuUserRoundPlus}
            label="Provisioning"
            value={provisionCount}
          />
          <DashboardPod
            description="Connect and manage automated user provisioning."
            href="/users/provisions/scim"
            icon={LuSettings2}
            label="Configure SCIM"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardPod
            description="Manage teaching and study groups."
            href="/groups"
            icon={LuLayers3}
            label="Groups"
            value={groupCount}
          />
          <DashboardPod
            description="Manage programme intakes and their dates."
            href="/cohorts"
            icon={LuGraduationCap}
            label="Cohorts"
            value={cohortCount}
          />
        </div>
      </div>
    </div>
  );
}
