import { LuFileHeart } from 'react-icons/lu';

import { NavigationLink } from '../../context';

export interface PatientProfileListItemViewModel {
  id: string;
  displayName: string;
  dateOfBirth: string;
  versionState: string;
  synopsis: string;
  lifeStage: string;
  specialties: readonly string[];
}

export interface PatientProfilesPageProps {
  error?: string;
  getProfileHref: (profile: PatientProfileListItemViewModel) => string;
  loading?: boolean;
  profiles: readonly PatientProfileListItemViewModel[];
}

const label = (value: string) => value.replaceAll('_', ' ');

export function PatientProfilesPage({
  error,
  getProfileHref,
  loading,
  profiles,
}: PatientProfilesPageProps) {
  if (error)
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  if (loading)
    return (
      <div
        aria-label="Loading patient profiles"
        className="h-96 animate-pulse bg-accent/40"
      />
    );

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-primary">Teaching catalogue</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Patient profiles
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Explore synthetic patients that can underpin EHR learning experiences.
          Profiles marked as draft preview have not yet completed clinical
          review.
        </p>
      </header>

      {profiles.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <NavigationLink
              className="group flex min-h-64 flex-col bg-paper p-5 shadow-[0_0_18px_-10px_rgb(0_0_0/0.25)] transition hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={getProfileHref(profile)}
              key={profile.id}
            >
              <div className="flex items-start justify-between gap-4">
                <LuFileHeart
                  aria-hidden="true"
                  className="mt-1 size-5 shrink-0 text-primary"
                />
                <span className="bg-accent/40 px-2 py-1 text-xs font-semibold capitalize text-foreground">
                  {profile.versionState === 'draft'
                    ? 'Draft preview'
                    : label(profile.versionState)}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold group-hover:text-primary">
                {profile.displayName}
              </h2>
              <p className="mt-1 text-xs capitalize text-muted-foreground">
                {label(profile.lifeStage)}
              </p>
              <p className="mt-4 line-clamp-4 text-sm text-muted-foreground">
                {profile.synopsis}
              </p>
              <p className="mt-auto pt-5 text-xs capitalize text-primary">
                {profile.specialties.map(label).join(' · ')}
              </p>
            </NavigationLink>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No patient profiles are available.
        </p>
      )}
    </div>
  );
}
