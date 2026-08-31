'use client';

import { useState, type ReactNode } from 'react';
import { LuPanelRightOpen, LuX } from 'react-icons/lu';

import { Button } from '../../atoms';

export interface SimulationTemplateProps {
  children: ReactNode;
  header: ReactNode;
  tools: ReactNode;
}

export function SimulationTemplate({
  children,
  header,
  tools,
}: SimulationTemplateProps) {
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <div
      className={`grid min-h-dvh bg-background text-foreground transition-[grid-template-columns] duration-200 motion-reduce:transition-none ${
        toolsOpen
          ? 'grid-cols-[minmax(0,1fr)_min(22rem,70vw)]'
          : 'grid-cols-[minmax(0,1fr)_0rem]'
      }`}
    >
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-surface">
          {header}
        </header>
        <main className="min-h-dvh">{children}</main>
        {!toolsOpen ? (
          <Button
            aria-label="Open simulation tools"
            className="fixed right-4 bottom-4 z-40 size-12 rounded-full bg-[#1c2b4a] text-white shadow-lg hover:bg-[#25395f] sm:right-6 sm:bottom-6"
            onClick={() => setToolsOpen(true)}
            size="icon"
          >
            <LuPanelRightOpen aria-hidden="true" className="size-5" />
          </Button>
        ) : null}
      </div>
      <aside
        aria-hidden={!toolsOpen}
        className="sticky top-0 h-dvh min-w-0 overflow-hidden border-l border-border bg-surface shadow-xl"
      >
        <div className="relative h-full w-[min(22rem,70vw)] overflow-y-auto p-6">
          <Button
            aria-label="Close simulation tools"
            className="absolute top-3 right-3"
            onClick={() => setToolsOpen(false)}
            size="icon-sm"
            variant="ghost"
          >
            <LuX aria-hidden="true" />
          </Button>
          {tools}
        </div>
      </aside>
    </div>
  );
}
