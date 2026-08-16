'use client';

import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from 'react';

export interface NavigationLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  href: string;
}

export type NavigationLinkComponent = ComponentType<NavigationLinkProps>;

export interface NavigationProviderProps {
  children: ReactNode;
  linkComponent: NavigationLinkComponent;
}

const NavigationContext = createContext<NavigationLinkComponent | 'a'>('a');

export function NavigationProvider({
  children,
  linkComponent,
}: NavigationProviderProps) {
  return (
    <NavigationContext.Provider value={linkComponent}>
      {children}
    </NavigationContext.Provider>
  );
}

export function NavigationLink(props: NavigationLinkProps) {
  const Link = useContext(NavigationContext);
  return <Link {...props} />;
}
