'use client';

import type { ReactNode } from 'react';
import { LuFileText, LuHouse, LuSettings } from 'react-icons/lu';

import { Logo, ThemeSwitcher } from '@hektor/ui/molecules';
import { AppHeader } from '@hektor/ui/organisms';
import { PaperTemplate } from '@hektor/ui/templates';

const menuItems = [
  { label: 'Home', icon: LuHouse, href: '/', active: true },
  { label: 'Documents', icon: LuFileText, href: '/documents' },
  { label: 'Settings', icon: LuSettings, href: '/settings' },
];

export default function AuthenticatedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <PaperTemplate
      header={<AppHeader title="Hektor" />}
      menuCompactHeader={<Logo size="md" variant="mark" />}
      menuFooter={<ThemeSwitcher />}
      menuHeader={<Logo size="md" />}
      menuItems={menuItems}
    >
      {children}
    </PaperTemplate>
  );
}
