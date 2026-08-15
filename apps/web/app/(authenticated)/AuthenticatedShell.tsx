'use client';

import { useState, type ReactNode } from 'react';
import { LuBuilding2, LuHouse, LuUsers } from 'react-icons/lu';
import { usePathname } from 'next/navigation';

import { PlatformRole } from '@hektor/types';
import { Logo, ThemeSwitcher } from '@hektor/ui/molecules';
import { AppHeader, UserWidget } from '@hektor/ui/organisms';
import { PaperTemplate } from '@hektor/ui/templates';
import { useGetCurrentUser } from '@hektor/query/users';

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
          membership.status === 'active' &&
          ['not_managed', 'active'].includes(membership.provisioningStatus),
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
    >
      {children}
    </PaperTemplate>
  );
}
