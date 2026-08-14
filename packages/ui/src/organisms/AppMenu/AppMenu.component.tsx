'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { LuMenu } from 'react-icons/lu';

import { Button } from '../../atoms/Button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '../../atoms/Sheet';
import { AppMenuItem } from '../../molecules/AppMenuItem';
import { cn } from '#lib/utils';

export type AppMenuState = 'hidden' | 'icons' | 'expanded';

export interface AppMenuEntry {
  active?: boolean;
  href?: string;
  icon: IconType;
  label: string;
  onSelect?: () => void;
}

export interface AppMenuProps {
  defaultState?: AppMenuState;
  footer?: ReactNode;
  header?: ReactNode;
  items: AppMenuEntry[];
  onStateChange?: (state: AppMenuState) => void;
  state?: AppMenuState;
}

export function nextAppMenuState(
  state: AppMenuState,
  desktop: boolean,
): AppMenuState {
  if (!desktop) return state === 'expanded' ? 'hidden' : 'expanded';
  if (state === 'hidden') return 'icons';
  if (state === 'icons') return 'expanded';
  return 'hidden';
}

function useDesktopViewport() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return desktop;
}

function MenuContents({
  collapsed,
  footer,
  header,
  items,
}: Pick<AppMenuProps, 'footer' | 'header' | 'items'> & {
  collapsed: boolean;
}) {
  return (
    <>
      {header ? (
        <div className={cn('min-h-12 px-3 py-4', collapsed && 'px-2')}>
          {header}
        </div>
      ) : null}
      <nav aria-label="Application" className="flex-1 space-y-1 px-2 py-3">
        {items.map((item) => (
          <AppMenuItem {...item} collapsed={collapsed} key={item.label} />
        ))}
      </nav>
      {footer && !collapsed ? (
        <div className="border-t border-border p-3">{footer}</div>
      ) : null}
    </>
  );
}

export function AppMenu({
  defaultState = 'icons',
  footer,
  header,
  items,
  onStateChange,
  state: controlledState,
}: AppMenuProps) {
  const desktop = useDesktopViewport();
  const [internalState, setInternalState] = useState(defaultState);
  const state = controlledState ?? internalState;

  const changeState = (nextState: AppMenuState) => {
    if (controlledState === undefined) setInternalState(nextState);
    onStateChange?.(nextState);
  };

  const toggle = () => changeState(nextAppMenuState(state, desktop));

  if (!desktop) {
    return (
      <>
        <Button
          aria-label="Toggle application menu"
          className="fixed top-4 left-4 z-40 shadow-sm"
          onClick={toggle}
          size="icon"
          variant="outline"
        >
          <LuMenu aria-hidden="true" />
        </Button>
        <Sheet
          onOpenChange={(open) => changeState(open ? 'expanded' : 'hidden')}
          open={state === 'expanded'}
        >
          <SheetContent className="bg-menu text-menu-foreground" side="left">
            <SheetTitle className="sr-only">Application menu</SheetTitle>
            <SheetDescription className="sr-only">
              Primary application navigation
            </SheetDescription>
            <MenuContents
              collapsed={false}
              footer={footer}
              header={header}
              items={items}
            />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  const collapsed = state === 'icons';

  return (
    <aside
      aria-label="Application menu"
      className={cn(
        'relative z-20 shrink-0 overflow-visible border-r border-border bg-menu text-menu-foreground transition-[width] duration-200 ease-out motion-reduce:transition-none',
        state === 'hidden' && 'w-0 border-r-0',
        collapsed && 'w-16',
        state === 'expanded' && 'w-64',
      )}
    >
      <Button
        aria-label="Cycle application menu"
        className={cn(
          'absolute top-4 z-30 shadow-sm',
          state === 'hidden' ? 'left-4' : 'right-3',
        )}
        onClick={toggle}
        size="icon"
        variant="outline"
      >
        <LuMenu aria-hidden="true" />
      </Button>
      {state === 'hidden' ? null : (
        <div className="flex h-svh flex-col overflow-hidden pt-14">
          <MenuContents
            collapsed={collapsed}
            footer={footer}
            header={header}
            items={items}
          />
        </div>
      )}
    </aside>
  );
}
