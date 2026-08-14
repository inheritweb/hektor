'use client';

import { useState, type ReactNode } from 'react';

import {
  AppMenu,
  type AppMenuEntry,
  type AppMenuState,
} from '../../organisms/AppMenu';
import { cn } from '#lib/utils';

export interface PaperTemplateProps {
  children: ReactNode;
  className?: string;
  menuFooter?: ReactNode;
  menuHeader?: ReactNode;
  menuItems: AppMenuEntry[];
  menuState?: AppMenuState;
  onMenuStateChange?: (state: AppMenuState) => void;
}

export function PaperTemplate({
  children,
  className,
  menuFooter,
  menuHeader,
  menuItems,
  menuState: controlledMenuState,
  onMenuStateChange,
}: PaperTemplateProps) {
  const [internalMenuState, setInternalMenuState] =
    useState<AppMenuState>('icons');
  const menuState = controlledMenuState ?? internalMenuState;

  const changeMenuState = (nextState: AppMenuState) => {
    if (controlledMenuState === undefined) setInternalMenuState(nextState);
    onMenuStateChange?.(nextState);
  };

  return (
    <div className="flex min-h-svh bg-paper text-foreground">
      <AppMenu
        footer={menuFooter}
        header={menuHeader}
        items={menuItems}
        onStateChange={changeMenuState}
        state={menuState}
      />
      <main className={cn('min-w-0 flex-1 px-6 pt-20 pb-8 md:p-8', className)}>
        {children}
      </main>
    </div>
  );
}
