'use client';

import { useSyncExternalStore } from 'react';
import { useGetTenantOrganisationContext } from '@hektor/query/organisations';
import { ACTIVE_ORGANISATION_STORAGE_KEY } from '@hektor/query';
import { ACTIVE_ORGANISATION_CHANGE_EVENT } from '@hektor/query';

export default function HomePage() {
  const hasOrganisation = useSyncExternalStore(
    (notify) => {
      window.addEventListener(ACTIVE_ORGANISATION_CHANGE_EVENT, notify);
      return () =>
        window.removeEventListener(ACTIVE_ORGANISATION_CHANGE_EVENT, notify);
    },
    () => Boolean(window.localStorage.getItem(ACTIVE_ORGANISATION_STORAGE_KEY)),
    () => false,
  );
  const organisation = useGetTenantOrganisationContext(undefined, {
    enabled: hasOrganisation,
  });

  if (hasOrganisation) {
    if (organisation.isPending) return <p>Loading organisation workspace…</p>;
    if (organisation.isError) {
      return <p role="alert">We could not load this organisation workspace.</p>;
    }

    const context = organisation.data?.data;
    return (
      <div className="space-y-8">
        <section>
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">
            Organisation workspace
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {context?.organisation.name}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {context?.accessMode === 'platform'
              ? 'You are viewing this workspace as a platform administrator.'
              : `Signed in as ${context?.role?.replace('_', ' ')}.`}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-primary text-xs font-bold tracking-[0.24em]">
          HEKTOR
        </p>
        <h1 className="mt-4 max-w-[12ch] text-5xl leading-[0.9] font-bold tracking-[-0.06em] sm:text-7xl lg:text-8xl">
          The workspace is ready.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
          Next.js, Turborepo, Yarn, Tailwind, and local Supabase are running
          together.
        </p>
      </section>
    </div>
  );
}
