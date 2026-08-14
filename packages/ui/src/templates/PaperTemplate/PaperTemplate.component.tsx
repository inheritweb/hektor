'use client';

import type { ReactNode } from 'react';

import { useTheme } from '../../context';
import {
  AppMenu,
  type AppMenuEntry,
  type AppMenuState,
} from '../../organisms/AppMenu';
import { cn } from '#lib/utils';

export interface PaperTemplateProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  header?: ReactNode;
  menuCompactHeader?: ReactNode;
  menuFooter?: ReactNode;
  menuHeader?: ReactNode;
  menuItems: AppMenuEntry[];
  menuState?: AppMenuState;
  onMenuStateChange?: (state: AppMenuState) => void;
}

export function PaperTemplate({
  children,
  className,
  contentClassName,
  header,
  menuCompactHeader,
  menuFooter,
  menuHeader,
  menuItems,
  menuState: controlledMenuState,
  onMenuStateChange,
}: PaperTemplateProps) {
  const { menuState: persistedMenuState, setMenuState } = useTheme();
  const menuState = controlledMenuState ?? persistedMenuState;

  const changeMenuState = (nextState: AppMenuState) => {
    if (controlledMenuState === undefined) setMenuState(nextState);
    onMenuStateChange?.(nextState);
  };

  return (
    <div className="flex min-h-svh bg-page text-foreground">
      <AppMenu
        compactHeader={menuCompactHeader}
        footer={menuFooter}
        header={menuHeader}
        items={menuItems}
        onStateChange={changeMenuState}
        state={menuState}
      />
      <main
        className={cn(
          'min-w-0 flex-1 px-6 pb-10 md:px-10 md:pb-12 lg:px-14',
          className,
        )}
      >
        {header ? (
          <div className="mx-auto w-full max-w-7xl shrink-0 py-6 pl-14 md:py-8 md:pl-0">
            {header}
          </div>
        ) : (
          <div className="h-24 shrink-0 md:h-16" />
        )}
        <div
          data-slot="paper"
          className={cn(
            'mx-auto w-full max-w-7xl border border-border bg-paper p-8 shadow-sm md:p-12',
            contentClassName,
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
