'use client';

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { cn } from '#lib/utils';

export function TooltipProvider({
  delay = 250,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />;
}

export function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root {...props} />;
}

export function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger {...props} />;
}

export function TooltipContent({
  align = 'center',
  children,
  className,
  side = 'right',
  sideOffset = 8,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, 'align' | 'side' | 'sideOffset'>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          {...props}
          className={cn(
            'rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md data-closed:animate-out data-open:animate-in motion-reduce:animate-none',
            className,
          )}
        >
          {children}
          <TooltipPrimitive.Arrow className="size-2 rotate-45 bg-foreground" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}
