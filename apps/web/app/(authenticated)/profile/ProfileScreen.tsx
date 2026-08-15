'use client';

import { useCurrentUser } from '@hektor/query/users';
import { ProfilePage } from '@hektor/ui/pages';

export function ProfileScreen() {
  const currentUser = useCurrentUser();

  if (currentUser.isPending) {
    return (
      <div className="space-y-4" aria-label="Loading profile">
        <div className="h-20 w-20 animate-pulse rounded-full bg-accent" />
        <div className="h-8 w-64 animate-pulse bg-accent" />
        <div className="h-40 animate-pulse bg-accent/60" />
      </div>
    );
  }

  if (currentUser.isError) {
    return (
      <section>
        <h1 className="text-2xl font-bold">
          We couldn&apos;t load your profile.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Refresh the page to try again.
        </p>
      </section>
    );
  }

  return <ProfilePage {...currentUser.data.data} />;
}
