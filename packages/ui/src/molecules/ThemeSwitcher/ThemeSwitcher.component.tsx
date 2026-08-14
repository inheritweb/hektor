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
      className={cn('flex w-full items-center justify-center', className)}
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
                  'size-12 cursor-pointer rounded-none border-r-0 bg-black/[0.025] last:border-r hover:bg-black/5 dark:bg-black/10 dark:hover:bg-black/15',
                  index === 0 && 'rounded-l-lg',
                  index === choices.length - 1 && 'rounded-r-lg',
                  preference === choice &&
                    'relative z-10 bg-surface text-foreground shadow-inner hover:bg-surface dark:bg-surface dark:hover:bg-surface',
                )}
                onClick={() => setPreference(choice as ThemePreference)}
                size="icon-lg"
                variant="outline"
              />
            }
          >
            <Icon aria-hidden="true" className="size-5" />
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
