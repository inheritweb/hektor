'use client';

import { LuLogOut, LuUserRound } from 'react-icons/lu';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/Select';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../atoms/Tooltip';

export interface UserContextOption {
  id: string;
  label: string;
}

export interface UserWidgetProps {
  avatarUrl?: string;
  compact?: boolean;
  contexts: UserContextOption[];
  currentContextId: string;
  displayName: string;
  email?: string;
  onContextChange: (contextId: string) => void;
  onSignOut: () => void;
  profileHref: string;
}

function Initials({ displayName }: Pick<UserWidgetProps, 'displayName'>) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || <LuUserRound aria-hidden="true" className="size-5" />;
}

function Avatar({
  avatarUrl,
  displayName,
}: Pick<UserWidgetProps, 'avatarUrl' | 'displayName'>) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {avatarUrl ? (
        <img alt="" className="size-full object-cover" src={avatarUrl} />
      ) : (
        <Initials displayName={displayName} />
      )}
    </span>
  );
}

export function UserWidget({
  avatarUrl,
  compact = false,
  contexts,
  currentContextId,
  displayName,
  email,
  onContextChange,
  onSignOut,
  profileHref,
}: UserWidgetProps) {
  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              aria-label={`Open profile for ${displayName}`}
              className="flex justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={profileHref}
            />
          }
        >
          <Avatar avatarUrl={avatarUrl} displayName={displayName} />
        </TooltipTrigger>
        <TooltipContent>View profile</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <section aria-label="Signed-in user" className="w-full space-y-3">
      <div className="flex min-w-0 items-center gap-3">
        <a
          className="flex min-w-0 flex-1 items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={profileHref}
        >
          <Avatar avatarUrl={avatarUrl} displayName={displayName} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-menu-foreground">
              {displayName}
            </span>
            {email ? (
              <span className="block truncate text-xs text-muted-foreground">
                {email}
              </span>
            ) : null}
          </span>
        </a>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                aria-label="Sign out"
                className="cursor-pointer p-2 text-muted-foreground outline-none hover:text-menu-foreground focus-visible:ring-2 focus-visible:ring-ring"
                onClick={onSignOut}
                type="button"
              />
            }
          >
            <LuLogOut aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </TooltipTrigger>
          <TooltipContent>Sign out</TooltipContent>
        </Tooltip>
      </div>
      <Select
        items={contexts.map(({ id: value, label }) => ({ label, value }))}
        onValueChange={(value) => value && onContextChange(value)}
        value={currentContextId}
      >
        <SelectTrigger
          aria-label="Active account or organisation"
          className="bg-menu hover:bg-accent/50"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {contexts.map((context) => (
            <SelectItem key={context.id} value={context.id}>
              {context.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </section>
  );
}
