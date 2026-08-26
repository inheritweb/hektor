'use client';

import { useState, type ReactNode } from 'react';
import { LuBuilding2, LuHouse, LuUsers } from 'react-icons/lu';
import { usePathname } from 'next/navigation';

import { PlatformRole } from '@hektor/types';
import { Logo, ThemeSwitcher } from '@hektor/ui/molecules';
import {
  AppHeader,
  GlobalToolbar,
  type GlobalToolbarBreadcrumb,
  UserWidget,
} from '@hektor/ui/organisms';
import { PaperTemplate } from '@hektor/ui/templates';
import {
  useAdminGetOrganisation,
  useAdminGetOrganisationCohort,
  useAdminGetOrganisationGroup,
  useAdminGetOrganisationMembership,
  useAdminGetOrganisationUserProvision,
} from '@hektor/query/organisations';
import { useGetCurrentUser } from '@hektor/query/users';

export function breadcrumbsForPath(
  pathname: string,
  organisationName = 'Organisation',
  cohortName = 'Cohort',
  groupName = 'Group',
  provisionName = 'Provisioned user',
  membershipName = 'Organisation user',
): GlobalToolbarBreadcrumb[] {
  if (pathname === '/') return [{ label: 'Home' }];

  const home = { label: 'Home', href: '/' };
  if (pathname === '/profile') return [home, { label: 'Profile' }];

  if (pathname.startsWith('/admin/users/')) {
    if (pathname === '/admin/users/new') {
      return [
        home,
        { label: 'Admin' },
        { label: 'Users', href: '/admin/users' },
        { label: 'Add user' },
      ];
    }
    return [
      home,
      { label: 'Admin' },
      { label: 'Users', href: '/admin/users' },
      { label: 'User details' },
    ];
  }

  if (pathname === '/admin/users') {
    return [home, { label: 'Admin' }, { label: 'Users' }];
  }

  if (pathname.startsWith('/admin/organisations')) {
    if (pathname === '/admin/organisations') {
      return [home, { label: 'Admin' }, { label: 'Organisations' }];
    }

    if (pathname === '/admin/organisations/new') {
      return [
        home,
        { label: 'Admin' },
        { label: 'Organisations', href: '/admin/organisations' },
        { label: 'New organisation' },
      ];
    }

    return [
      home,
      { label: 'Admin' },
      { label: 'Organisations', href: '/admin/organisations' },
      ...(pathname.match(/\/users\/[^/]+\/edit$/)
        ? [
            {
              label: organisationName,
              href: pathname.slice(0, pathname.lastIndexOf('/users/')),
            },
            {
              label: 'Users',
              href: pathname.slice(0, pathname.lastIndexOf('/users/') + 6),
            },
            { label: membershipName, href: pathname.slice(0, -5) },
            { label: 'Edit' },
          ]
        : pathname.match(/\/users\/[^/]+$/)
          ? [
              {
                label: organisationName,
                href: pathname.slice(0, pathname.lastIndexOf('/users/')),
              },
              {
                label: 'Users',
                href: pathname.slice(0, pathname.lastIndexOf('/')),
              },
              { label: membershipName },
            ]
          : pathname.match(/\/provisioned-users\/[^/]+$/)
            ? [
                {
                  label: organisationName,
                  href: pathname.slice(
                    0,
                    pathname.lastIndexOf('/provisioned-users/'),
                  ),
                },
                {
                  label: 'Provisioned users',
                  href: pathname.slice(0, pathname.lastIndexOf('/')),
                },
                { label: provisionName },
              ]
            : pathname.endsWith('/contract-periods/new')
              ? [
                  {
                    label: organisationName,
                    href: pathname.slice(0, -21),
                  },
                  {
                    label: 'Contract periods',
                    href: pathname.slice(0, -4),
                  },
                  { label: 'New contract period' },
                ]
              : pathname.match(/\/contract-periods\/[^/]+\/edit$/)
                ? [
                    {
                      label: organisationName,
                      href: pathname.slice(
                        0,
                        pathname.lastIndexOf('/contract-periods/'),
                      ),
                    },
                    {
                      label: 'Contract periods',
                      href: pathname.slice(
                        0,
                        pathname.lastIndexOf('/contract-periods/') + 17,
                      ),
                    },
                    { label: 'Edit contract period' },
                  ]
                : pathname.endsWith('/cohorts/new')
                  ? [
                      {
                        label: organisationName,
                        href: pathname.slice(0, -12),
                      },
                      {
                        label: 'Cohorts',
                        href: pathname.slice(0, -4),
                      },
                      { label: 'New cohort' },
                    ]
                  : pathname.match(/\/cohorts\/[^/]+\/edit$/)
                    ? [
                        {
                          label: organisationName,
                          href: pathname.slice(
                            0,
                            pathname.lastIndexOf('/cohorts/'),
                          ),
                        },
                        {
                          label: 'Cohorts',
                          href: pathname.slice(
                            0,
                            pathname.lastIndexOf('/cohorts/') + 8,
                          ),
                        },
                        { label: cohortName, href: pathname.slice(0, -5) },
                        { label: 'Edit' },
                      ]
                    : pathname.endsWith('/groups/new')
                      ? [
                          {
                            label: organisationName,
                            href: pathname.slice(0, -11),
                          },
                          {
                            label: 'Groups',
                            href: pathname.slice(0, -4),
                          },
                          { label: 'New group' },
                        ]
                      : pathname.match(/\/groups\/[^/]+\/edit$/)
                        ? [
                            {
                              label: organisationName,
                              href: pathname.slice(
                                0,
                                pathname.lastIndexOf('/groups/'),
                              ),
                            },
                            {
                              label: 'Groups',
                              href: pathname.slice(
                                0,
                                pathname.lastIndexOf('/groups/') + 7,
                              ),
                            },
                            { label: groupName, href: pathname.slice(0, -5) },
                            { label: 'Edit' },
                          ]
                        : pathname.endsWith('/edit')
                          ? [
                              {
                                label: organisationName,
                                href: pathname.slice(0, -5),
                              },
                              { label: 'Edit' },
                            ]
                          : pathname.match(/\/groups\/[^/]+$/)
                            ? [
                                {
                                  label: organisationName,
                                  href: pathname.slice(
                                    0,
                                    pathname.lastIndexOf('/groups/'),
                                  ),
                                },
                                {
                                  label: 'Groups',
                                  href: pathname.slice(
                                    0,
                                    pathname.lastIndexOf('/'),
                                  ),
                                },
                                { label: groupName },
                              ]
                            : pathname.endsWith('/groups')
                              ? [
                                  {
                                    label: organisationName,
                                    href: pathname.slice(0, -7),
                                  },
                                  { label: 'Groups' },
                                ]
                              : pathname.match(/\/cohorts\/[^/]+$/)
                                ? [
                                    {
                                      label: organisationName,
                                      href: pathname.slice(
                                        0,
                                        pathname.lastIndexOf('/cohorts/'),
                                      ),
                                    },
                                    {
                                      label: 'Cohorts',
                                      href: pathname.slice(
                                        0,
                                        pathname.lastIndexOf('/'),
                                      ),
                                    },
                                    { label: cohortName },
                                  ]
                                : pathname.endsWith('/cohorts')
                                  ? [
                                      {
                                        label: organisationName,
                                        href: pathname.slice(0, -8),
                                      },
                                      { label: 'Cohorts' },
                                    ]
                                  : pathname.endsWith('/contract-periods')
                                    ? [
                                        {
                                          label: organisationName,
                                          href: pathname.slice(0, -17),
                                        },
                                        { label: 'Contract periods' },
                                      ]
                                    : pathname.endsWith('/provisioned-users')
                                      ? [
                                          {
                                            label: organisationName,
                                            href: pathname.slice(0, -18),
                                          },
                                          { label: 'Provisioned users' },
                                        ]
                                      : pathname.endsWith('/users')
                                        ? [
                                            {
                                              label: organisationName,
                                              href: pathname.slice(0, -6),
                                            },
                                            { label: 'Users' },
                                          ]
                                        : [{ label: organisationName }]),
    ];
  }

  return [home];
}

export function AuthenticatedShell({
  children,
  fallbackUser,
}: Readonly<{
  children: ReactNode;
  fallbackUser: {
    displayName: string;
    email?: string;
    platformRole?: PlatformRole;
  };
}>) {
  const pathname = usePathname();
  const organisationId = pathname.match(
    /^\/admin\/organisations\/([^/]+)/,
  )?.[1];
  const resolvedOrganisationId =
    organisationId === 'new' ? undefined : organisationId;
  const matchedCohortId = pathname.match(/\/cohorts\/([^/]+)(?:\/edit)?$/)?.[1];
  const cohortId = matchedCohortId === 'new' ? undefined : matchedCohortId;
  const matchedGroupId = pathname.match(/\/groups\/([^/]+)(?:\/edit)?$/)?.[1];
  const groupId = matchedGroupId === 'new' ? undefined : matchedGroupId;
  const provisionId = pathname.match(/\/provisioned-users\/([^/]+)$/)?.[1];
  const membershipId = pathname.match(/\/users\/([^/]+)(?:\/edit)?$/)?.[1];
  const breadcrumbOrganisation = useAdminGetOrganisation(
    { params: { organisationId: resolvedOrganisationId ?? '' } },
    { enabled: Boolean(resolvedOrganisationId) },
  );
  const breadcrumbCohort = useAdminGetOrganisationCohort(
    {
      params: {
        cohortId: cohortId ?? '',
        organisationId: resolvedOrganisationId ?? '',
      },
    },
    { enabled: Boolean(cohortId && resolvedOrganisationId) },
  );
  const breadcrumbGroup = useAdminGetOrganisationGroup(
    {
      params: {
        groupId: groupId ?? '',
        organisationId: resolvedOrganisationId ?? '',
      },
    },
    { enabled: Boolean(groupId && resolvedOrganisationId) },
  );
  const breadcrumbProvision = useAdminGetOrganisationUserProvision(
    {
      params: {
        organisationId: resolvedOrganisationId ?? '',
        provisionId: provisionId ?? '',
      },
    },
    { enabled: Boolean(resolvedOrganisationId && provisionId) },
  );
  const breadcrumbMembership = useAdminGetOrganisationMembership(
    {
      params: {
        organisationId: resolvedOrganisationId ?? '',
        membershipId: membershipId ?? '',
      },
    },
    { enabled: Boolean(resolvedOrganisationId && membershipId) },
  );
  const breadcrumbs = breadcrumbsForPath(
    pathname,
    breadcrumbOrganisation.data?.data.name,
    breadcrumbCohort.data?.data.name,
    breadcrumbGroup.data?.data.name,
    breadcrumbProvision.data?.data.provisionedDisplayName ??
      breadcrumbProvision.data?.data.provisionedUserName,
    breadcrumbMembership.data?.data.user.displayName,
  );
  const currentUser = useGetCurrentUser();
  const [currentContextId, setCurrentContextId] = useState('personal');
  const user = currentUser.data?.data;
  const platformRole = user?.platformRole ?? fallbackUser.platformRole;
  const menuSections = [
    {
      items: [
        { label: 'Home', icon: LuHouse, href: '/', active: pathname === '/' },
      ],
    },
    ...(platformRole === PlatformRole.Admin
      ? [
          {
            label: 'Admin',
            items: [
              {
                label: 'Users',
                icon: LuUsers,
                href: '/admin/users',
                active: pathname.startsWith('/admin/users'),
              },
              {
                label: 'Organisations',
                icon: LuBuilding2,
                href: '/admin/organisations',
                active: pathname.startsWith('/admin/organisations'),
              },
            ],
          },
        ]
      : []),
  ];
  const contexts = [
    { id: 'personal', label: 'Personal account' },
    ...(user?.memberships
      .filter(
        (membership) =>
          membership.organisation.status === 'active' &&
          membership.status === 'active',
      )
      .map((membership) => ({
        id: membership.organisation.id,
        label: membership.organisation.name,
      })) ?? []),
  ];

  const signOut = async () => {
    await fetch('/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  };
  const userWidgetProps = {
    avatarUrl: user?.avatarUrl,
    contexts,
    currentContextId,
    displayName: user?.displayName ?? fallbackUser.displayName,
    email: user?.email ?? fallbackUser.email,
    onContextChange: setCurrentContextId,
    onSignOut: signOut,
    profileHref: '/profile',
  };

  return (
    <PaperTemplate
      header={<AppHeader title="Hektor" />}
      menuCompactFooter={<UserWidget {...userWidgetProps} compact />}
      menuCompactHeader={<Logo size="md" variant="mark" />}
      menuFooter={
        <div className="space-y-4">
          <div className="flex justify-center">
            <ThemeSwitcher />
          </div>
          <div className="border-t border-border pt-4">
            <UserWidget {...userWidgetProps} />
          </div>
        </div>
      }
      menuHeader={<Logo size="md" />}
      menuSections={menuSections}
      toolbar={<GlobalToolbar breadcrumbs={breadcrumbs} />}
    >
      {children}
    </PaperTemplate>
  );
}
