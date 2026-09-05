import { LuGitBranch } from 'react-icons/lu';

import { NavigationLink } from '../../context';

export interface AdminPatientScenarioListItemViewModel {
  id: string;
  title: string;
  patientName: string;
  description: string;
  status: string;
  careSetting: string;
  versionNumber: number;
}

export interface AdminPatientScenariosPageProps {
  error?: string;
  loading?: boolean;
  scenarios: readonly AdminPatientScenarioListItemViewModel[];
}

const label = (value: string) => value.replaceAll('_', ' ');

export function AdminPatientScenariosPage({
  error,
  loading,
  scenarios,
}: AdminPatientScenariosPageProps) {
  if (error)
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  if (loading)
    return (
      <div
        aria-label="Loading patient scenarios"
        className="h-96 animate-pulse bg-accent/40"
      />
    );

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-primary">Teaching catalogue</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Scenarios</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Manage the presenting conditions and evolving clinical narratives
          built on patient profiles.
        </p>
      </header>

      {scenarios.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((scenario) => (
            <NavigationLink
              className="group flex min-h-56 flex-col bg-paper p-5 shadow-[0_0_18px_-10px_rgb(0_0_0/0.25)] transition hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={`/admin/patient-scenarios/${scenario.id}/edit`}
              key={scenario.id}
            >
              <div className="flex items-start justify-between gap-4">
                <LuGitBranch
                  aria-hidden="true"
                  className="mt-1 size-5 shrink-0 text-primary"
                />
                <span className="bg-accent/40 px-2 py-1 text-xs font-semibold capitalize">
                  {label(scenario.status)}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold group-hover:text-primary">
                {scenario.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-foreground">
                {scenario.patientName}
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                {scenario.description}
              </p>
              <p className="mt-auto pt-5 text-xs capitalize text-primary">
                {label(scenario.careSetting)} · Version {scenario.versionNumber}
              </p>
            </NavigationLink>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No patient scenarios are available.
        </p>
      )}
    </div>
  );
}
