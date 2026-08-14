'use client';

import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { LuX } from 'react-icons/lu';

import { cn } from '#lib/utils';

import { Button } from '../Button';

export function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetOverlay(props: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      {...props}
      className={cn(
        'fixed inset-0 z-50 bg-black/20 backdrop-blur-xs transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none',
        props.className,
      )}
    />
  );
}

export interface SheetContentProps extends SheetPrimitive.Popup.Props {
  side?: 'left' | 'right';
  showCloseButton?: boolean;
}

export function SheetContent({
  children,
  className,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-side={side}
        data-slot="sheet-content"
        className={cn(
          'fixed inset-y-0 z-50 flex w-[min(20rem,85vw)] flex-col border-border bg-surface text-surface-foreground shadow-xl transition duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none',
          'data-[side=left]:left-0 data-[side=left]:border-r data-[side=left]:data-ending-style:-translate-x-10 data-[side=left]:data-starting-style:-translate-x-10',
          'data-[side=right]:right-0 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-10 data-[side=right]:data-starting-style:translate-x-10',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <SheetPrimitive.Close
            render={
              <Button
                aria-label="Close"
                className="absolute top-3 right-3"
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <LuX />
          </SheetPrimitive.Close>
        ) : null}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

export function SheetTitle(props: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      {...props}
      className={cn('text-base font-semibold', props.className)}
    />
  );
}

export function SheetDescription(props: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      {...props}
      className={cn('text-sm text-muted-foreground', props.className)}
    />
  );
}
