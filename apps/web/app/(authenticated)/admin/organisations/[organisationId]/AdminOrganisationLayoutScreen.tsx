'use client';

import type { ReactNode } from 'react';

import { useAdminGetOrganisation } from '@hektor/query/organisations';
import { OrganisationDetailsRail } from '@hektor/ui/organisms';

export function AdminOrganisationLayoutScreen({
  children,
  organisationId,
}: {
  children: ReactNode;
  organisationId: string;
}) {
  const organisation = useAdminGetOrganisation({
    params: { organisationId },
  });

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)] lg:gap-14">
      {organisation.data ? (
        <OrganisationDetailsRail organisation={organisation.data.data} />
      ) : organisation.isError ? (
        <div className="text-sm text-destructive">
          {organisation.error.message}
        </div>
      ) : (
        <div aria-label="Loading organisation" className="space-y-4">
          <div className="h-16 animate-pulse bg-accent/70" />
          <div className="h-40 animate-pulse bg-accent/50" />
        </div>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
