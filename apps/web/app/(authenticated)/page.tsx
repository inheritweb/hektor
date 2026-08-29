'use client';

import { useSyncExternalStore } from 'react';

import {
  ACTIVE_ORGANISATION_CHANGE_EVENT,
  ACTIVE_ORGANISATION_STORAGE_KEY,
} from '@hektor/query';
import { useGetTenantOrganisationContext } from '@hektor/query/organisations';
import {
  useGetOrganisationStatistics,
  useGetPlatformStatistics,
} from '@hektor/query/statistics';
import { useGetCurrentUser } from '@hektor/query/users';
import { OrganisationRole, PlatformRole } from '@hektor/types';
import { DashboardPage } from '@hektor/ui/pages';

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
  const currentUser = useGetCurrentUser();
  const organisation = useGetTenantOrganisationContext(undefined, {
    enabled: hasOrganisation,
  });
  const organisationContext = organisation.data?.data;
  const canManageOrganisation =
    organisationContext?.accessMode === 'platform' ||
    organisationContext?.role === OrganisationRole.OrganisationAdmin;
  const organisationStatistics = useGetOrganisationStatistics(undefined, {
    enabled: hasOrganisation && canManageOrganisation,
  });
  const isPlatformAdmin =
    currentUser.data?.data.platformRole === PlatformRole.Admin;
  const platformStatistics = useGetPlatformStatistics(undefined, {
    enabled: !hasOrganisation && isPlatformAdmin,
  });

  if (hasOrganisation) {
    if (organisation.isError) {
      return (
        <DashboardPage
          error="We could not load this organisation workspace."
          eyebrow="Organisation workspace"
          pods={[]}
          title="Dashboard"
        />
      );
    }

    if (!organisation.isPending && !canManageOrganisation) {
      return (
        <DashboardPage
          eyebrow="Organisation workspace"
          pods={[]}
          title={organisationContext?.organisation.name ?? 'Dashboard'}
        />
      );
    }

    const statistics = organisationStatistics.data?.data;
    return (
      <DashboardPage
        error={organisationStatistics.error?.message}
        eyebrow="Organisation workspace"
        loading={organisation.isPending || organisationStatistics.isPending}
        pods={[
          {
            description: 'Manage users connected to this organisation.',
            href: '/users',
            label: 'Users',
            value: statistics?.userCount ?? 0,
          },
          {
            description: 'Manage learner cohorts and their dates.',
            href: '/cohorts',
            label: 'Cohorts',
            value: statistics?.cohortCount ?? 0,
          },
          {
            description: 'Manage local and externally provisioned groups.',
            href: '/groups',
            label: 'Groups',
            value: statistics?.groupCount ?? 0,
          },
        ]}
        title={organisationContext?.organisation.name ?? 'Dashboard'}
      />
    );
  }

  if (currentUser.isPending || isPlatformAdmin) {
    const statistics = platformStatistics.data?.data;
    return (
      <DashboardPage
        error={platformStatistics.error?.message ?? currentUser.error?.message}
        eyebrow="Platform administration"
        loading={currentUser.isPending || platformStatistics.isPending}
        pods={[
          {
            description: 'Manage every Hektor account.',
            href: '/admin/users',
            label: 'Users',
            value: statistics?.userCount ?? 0,
          },
          {
            description: 'Manage organisations and their lifecycle.',
            href: '/admin/organisations',
            label: 'Organisations',
            value: statistics?.organisationCount ?? 0,
          },
        ]}
        title="Dashboard"
      />
    );
  }

  return (
    <DashboardPage eyebrow="Personal account" pods={[]} title="Dashboard" />
  );
}
