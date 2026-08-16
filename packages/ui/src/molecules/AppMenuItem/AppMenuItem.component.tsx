'use client';

import type { IconType } from 'react-icons';

import { Button, buttonVariants } from '../../atoms/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../atoms/Tooltip';
import { NavigationLink } from '../../context';
import { cn } from '#lib/utils';

export interface AppMenuItemProps {
  active?: boolean;
  collapsed?: boolean;
  href?: string;
  icon: IconType;
  label: string;
  onSelect?: () => void;
}

export function AppMenuItem({
  active = false,
  collapsed = false,
  href,
  icon: Icon,
  label,
  onSelect,
}: AppMenuItemProps) {
  const className = cn(
    'w-full justify-start gap-3 text-muted-foreground hover:bg-accent/40 hover:text-foreground',
    collapsed && 'size-11 justify-center rounded-md p-0',
    active && 'bg-accent/55 text-foreground/75',
  );
  const content = (
    <>
      <Icon
        aria-hidden="true"
        className={collapsed ? 'size-7' : 'size-5'}
        strokeWidth={1.5}
      />
      {collapsed ? null : <span>{label}</span>}
    </>
  );
  const sharedProps = {
    'aria-current': active ? ('page' as const) : undefined,
    'aria-label': collapsed ? label : undefined,
    onClick: onSelect,
  };
  const item = href ? (
    <NavigationLink
      {...sharedProps}
      className={cn(
        buttonVariants({
          size: collapsed ? 'icon' : 'lg',
          variant: 'ghost',
        }),
        className,
      )}
      href={href}
    >
      {content}
    </NavigationLink>
  ) : (
    <Button
      {...sharedProps}
      className={className}
      size={collapsed ? 'icon' : 'lg'}
      variant="ghost"
    >
      {content}
    </Button>
  );

  if (!collapsed) return item;

  return (
    <Tooltip>
      <TooltipTrigger render={item} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
