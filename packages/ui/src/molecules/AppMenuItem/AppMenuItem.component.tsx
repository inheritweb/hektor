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
        'w-full justify-start gap-3',
        collapsed && 'justify-center px-0',
        active && 'bg-accent text-accent-foreground',
      )}
      onClick={onSelect}
      render={href ? <a href={href} /> : undefined}
      size={collapsed ? 'icon' : 'lg'}
      variant="ghost"
    >
      <Icon aria-hidden="true" />
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
