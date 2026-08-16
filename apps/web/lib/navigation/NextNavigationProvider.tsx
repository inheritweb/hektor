'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';

import {
  NavigationProvider,
  type NavigationLinkProps,
} from '@hektor/ui/context';

function NextNavigationLink({ href, ...props }: NavigationLinkProps) {
  return <Link href={href as Route} {...props} />;
}

export function NextNavigationProvider({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider linkComponent={NextNavigationLink}>
      {children}
    </NavigationProvider>
  );
}
