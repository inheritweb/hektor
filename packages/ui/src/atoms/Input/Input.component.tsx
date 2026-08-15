import type { ComponentProps } from 'react';

import { cn } from '#lib/utils';

export type InputProps = ComponentProps<'input'>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-11 w-full border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
