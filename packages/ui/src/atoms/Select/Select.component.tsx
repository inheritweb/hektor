'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

import { cn } from '#lib/utils';

export const Select = SelectPrimitive.Root;

export function SelectTrigger({
  children,
  className,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border border-border bg-surface px-3.5 text-left text-sm text-surface-foreground shadow-xs outline-none transition-colors',
        'hover:bg-accent/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25',
        'data-popup-open:border-ring data-popup-open:ring-2 data-popup-open:ring-ring/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <LuChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform data-popup-open:rotate-180"
          strokeWidth={1.75}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue(props: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value {...props} />;
}

export function SelectContent({
  children,
  className,
  ...props
}: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align="start"
        className="z-60 outline-none"
        sideOffset={6}
      >
        <SelectPrimitive.Popup
          className={cn(
            'min-w-(--anchor-width) origin-(--transform-origin) border border-border bg-surface p-1 text-surface-foreground shadow-lg outline-none',
            'transition-[transform,scale,opacity] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none',
            className,
          )}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  children,
  className,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex min-h-10 cursor-pointer select-none items-center py-2 pr-9 pl-3 text-sm outline-none',
        'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-3 flex items-center">
        <LuCheck aria-hidden="true" className="size-4" strokeWidth={2} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
