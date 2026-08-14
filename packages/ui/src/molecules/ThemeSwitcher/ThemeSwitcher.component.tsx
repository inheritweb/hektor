'use client';

import { LuLaptop, LuMoon, LuSun } from 'react-icons/lu';

import { Button } from '../../atoms/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../atoms/Tooltip';
import { useTheme, type ThemePreference } from '../../context';
import { cn } from '#lib/utils';

const choices = [
  { preference: 'light', label: 'Use light theme', Icon: LuSun },
  { preference: 'system', label: 'Use system theme', Icon: LuLaptop },
  { preference: 'dark', label: 'Use dark theme', Icon: LuMoon },
] as const;

export interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      aria-label="Theme preference"
      className={cn('inline-flex', className)}
      role="group"
    >
      {choices.map(({ preference: choice, label, Icon }, index) => (
        <Tooltip key={choice}>
          <TooltipTrigger
            render={
              <Button
                aria-label={label}
                aria-pressed={preference === choice}
                className={cn(
                  'rounded-none border-r-0 px-2 last:border-r',
                  index === 0 && 'rounded-l-lg',
                  index === choices.length - 1 && 'rounded-r-lg',
                  preference === choice &&
                    'relative z-10 bg-accent text-accent-foreground',
                )}
                onClick={() => setPreference(choice as ThemePreference)}
                size="icon"
                variant="outline"
              />
            }
          >
            <Icon aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
