'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { LuArrowLeft, LuMenu } from 'react-icons/lu';

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

export interface AppMenuSection {
  items: AppMenuEntry[];
  label?: string;
}

export interface AppMenuProps {
  compactFooter?: ReactNode;
  compactHeader?: ReactNode;
  defaultState?: AppMenuState;
  footer?: ReactNode;
  header?: ReactNode;
  onStateChange?: (state: AppMenuState) => void;
  sections: AppMenuSection[];
  state?: AppMenuState;
}

export function nextAppMenuState(state: AppMenuState): AppMenuState {
  return state === 'expanded' ? 'hidden' : 'expanded';
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
  compactFooter,
  compactHeader,
  footer,
  header,
  sections,
}: Pick<
  AppMenuProps,
  'compactFooter' | 'compactHeader' | 'footer' | 'header' | 'sections'
> & {
  collapsed: boolean;
}) {
  return (
    <>
      {header || compactHeader ? (
        <div
          className={cn(
            'min-h-12 px-3 py-4',
            collapsed && 'flex justify-center px-2',
          )}
        >
          {collapsed ? compactHeader : header}
        </div>
      ) : null}
      <nav
        aria-label="Application"
        className={cn(
          'flex-1 space-y-1 px-2 py-3',
          collapsed && 'flex flex-col items-center gap-1 space-y-0',
        )}
      >
        {sections.map((section, index) => (
          <section
            className={cn(
              collapsed && 'w-full',
              index > 0 && (collapsed ? 'mt-3' : 'mt-6'),
            )}
            key={section.label ?? index}
          >
            {section.label ? (
              <h2
                className={cn(
                  'px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground',
                  collapsed && 'sr-only',
                )}
              >
                {section.label}
              </h2>
            ) : null}
            <div
              className={cn(
                'space-y-1',
                collapsed && 'flex flex-col items-center',
              )}
            >
              {section.items.map((item) => (
                <AppMenuItem {...item} collapsed={collapsed} key={item.label} />
              ))}
            </div>
          </section>
        ))}
      </nav>
      {(collapsed ? compactFooter : footer) ? (
        <div className="p-3">{collapsed ? compactFooter : footer}</div>
      ) : null}
    </>
  );
}

export function AppMenu({
  compactFooter,
  compactHeader,
  defaultState = 'hidden',
  footer,
  header,
  onStateChange,
  sections,
  state: controlledState,
}: AppMenuProps) {
  const desktop = useDesktopViewport();
  const [internalState, setInternalState] = useState(defaultState);
  const state = controlledState ?? internalState;

  const changeState = (nextState: AppMenuState) => {
    if (controlledState === undefined) setInternalState(nextState);
    onStateChange?.(nextState);
  };

  const toggle = () => changeState(nextAppMenuState(state));

  if (!desktop) {
    return (
      <>
        <Button
          aria-label="Toggle application menu"
          className="fixed top-4 left-4 z-40 cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={toggle}
          size="icon-lg"
          variant="ghost"
        >
          <LuMenu aria-hidden="true" className="size-6" strokeWidth={1.5} />
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
              compactFooter={compactFooter}
              compactHeader={compactHeader}
              footer={footer}
              header={header}
              sections={sections}
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
        'sticky top-0 z-20 h-svh shrink-0 overflow-visible border-r border-border bg-menu text-menu-foreground transition-[width] duration-200 ease-out motion-reduce:transition-none',
        state === 'hidden' && 'w-0 border-r-0',
        collapsed && 'w-20',
        state === 'expanded' && 'w-64',
      )}
    >
      <Button
        aria-label="Toggle application menu"
        className={cn(
          'absolute top-4 z-30 cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground',
          state === 'hidden' ? 'left-4' : 'right-3',
          state === 'icons' && 'right-auto left-1/2 -translate-x-1/2',
        )}
        onClick={toggle}
        size="icon-lg"
        variant="ghost"
      >
        <LuMenu aria-hidden="true" className="size-6" strokeWidth={1.5} />
      </Button>
      {state === 'expanded' ? (
        <Button
          aria-label="Collapse application menu to icons"
          className="absolute top-4 left-4 z-30 cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={() => changeState('icons')}
          size="icon-lg"
          variant="ghost"
        >
          <LuArrowLeft
            aria-hidden="true"
            className="size-6"
            strokeWidth={1.5}
          />
        </Button>
      ) : null}
      {state === 'hidden' ? null : (
        <div className="flex h-full flex-col overflow-hidden pt-14">
          <MenuContents
            collapsed={collapsed}
            compactFooter={compactFooter}
            compactHeader={compactHeader}
            footer={footer}
            header={header}
            sections={sections}
          />
        </div>
      )}
    </aside>
  );
}
