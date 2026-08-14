'use client';

import type { IconType } from 'react-icons';

import { Button } from '../../atoms/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../atoms/Tooltip';
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
  const item = (
    <Button
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        'w-full justify-start gap-3 text-muted-foreground hover:bg-accent/40 hover:text-foreground',
        collapsed && 'size-11 justify-center rounded-md p-0',
        active && 'bg-accent/55 text-foreground/75',
      )}
      onClick={onSelect}
      render={href ? <a href={href} /> : undefined}
      size={collapsed ? 'icon' : 'lg'}
      variant="ghost"
    >
      <Icon
        aria-hidden="true"
        className={collapsed ? 'size-7' : 'size-5'}
        strokeWidth={1.5}
      />
      {collapsed ? null : <span>{label}</span>}
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
