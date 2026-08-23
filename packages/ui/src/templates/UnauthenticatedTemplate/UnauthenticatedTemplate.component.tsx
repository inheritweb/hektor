import type { ReactNode } from 'react';

import { Logo } from '../../molecules';
import { cn } from '#lib/utils';

export interface UnauthenticatedTemplateProps {
  children: ReactNode;
  width?: 'md' | 'lg';
}

export function UnauthenticatedTemplate({
  children,
  width = 'md',
}: UnauthenticatedTemplateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6 py-16 text-foreground">
      <div className={cn('w-full', width === 'lg' ? 'max-w-xl' : 'max-w-md')}>
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <section
          data-slot="paper"
          className="bg-paper p-8 shadow-[0_0_24px_-8px_rgb(0_0_0/0.12)] md:p-12 dark:shadow-[0_0_24px_-8px_rgb(0_0_0/0.3)]"
        >
          {children}
        </section>
      </div>
    </main>
  );
}
