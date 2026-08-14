import type { ReactNode } from 'react';

import { Logo } from '../../molecules/Logo';
import { cn } from '#lib/utils';

export interface AppHeaderProps {
  children?: ReactNode;
  className?: string;
  title: string;
}

export function AppHeader({ children, className, title }: AppHeaderProps) {
  return (
    <header
      className={cn(
        'flex min-h-14 items-center justify-between gap-6 text-title',
        className,
      )}
    >
      <Logo label={title} size="lg" />
      {children ? (
        <div className="flex items-center gap-2">{children}</div>
      ) : null}
    </header>
  );
}
