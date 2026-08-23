'use client';

import { useEffect, useRef, type ComponentProps } from 'react';

import { cn } from '#lib/utils';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  indeterminate?: boolean;
}

export function Checkbox({
  className,
  indeterminate,
  ...props
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  return (
    <input
      className={cn(
        'size-4 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      type="checkbox"
      {...props}
    />
  );
}
