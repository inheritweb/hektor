'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Checkbox,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '../../atoms';

export interface MembershipManagerItem {
  detail?: string;
  id: string;
  subtitle?: string;
  title: string;
}

export interface MembershipManagerChangeSet {
  addIds: string[];
  removeIds: string[];
}

export interface MembershipManagerSheetProps {
  currentMemberIds: readonly string[];
  description: string;
  emptyMessage: string;
  error?: string;
  items: readonly MembershipManagerItem[];
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onPageChange: (page: number) => void;
  onSave: (changes: MembershipManagerChangeSet) => void;
  onSearchChange: (query: string) => void;
  open: boolean;
  page: number;
  pageSize: number;
  pending?: boolean;
  search: string;
  title: string;
  totalRecords: number;
}

export function MembershipManagerSheet({
  currentMemberIds,
  description,
  emptyMessage,
  error,
  items,
  loading,
  onOpenChange,
  onPageChange,
  onSave,
  onSearchChange,
  open,
  page,
  pageSize,
  pending,
  search,
  title,
  totalRecords,
}: MembershipManagerSheetProps) {
  const currentMemberKey = currentMemberIds.join(',');
  const resolvedCurrentMemberIds = useMemo(
    () => (currentMemberKey ? currentMemberKey.split(',') : []),
    [currentMemberKey],
  );
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(resolvedCurrentMemberIds),
  );
  const initialIds = useMemo(
    () => new Set(resolvedCurrentMemberIds),
    [resolvedCurrentMemberIds],
  );

  useEffect(() => {
    if (open) setSelectedIds(new Set(resolvedCurrentMemberIds));
  }, [open, resolvedCurrentMemberIds]);

  const pageIds = items.map((item) => item.id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length;
  const allOnPage = pageIds.length > 0 && selectedOnPage === pageIds.length;
  const changes: MembershipManagerChangeSet = {
    addIds: [...selectedIds].filter((id) => !initialIds.has(id)),
    removeIds: [...initialIds].filter((id) => !selectedIds.has(id)),
  };
  const changeCount = changes.addIds.length + changes.removeIds.length;
  const pageCount = Math.max(1, Math.ceil(totalRecords / pageSize));

  const toggle = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const togglePage = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of pageIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-[min(42rem,95vw)]">
        <header className="border-b border-border px-5 py-5 pr-12">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="mt-1">{description}</SheetDescription>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          <Input
            aria-label={`Search ${title.toLowerCase()}`}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name or email"
            type="search"
            value={search}
          />

          <label className="flex items-center gap-3 border-b border-border pb-3 text-sm font-semibold">
            <Checkbox
              checked={allOnPage}
              disabled={loading || items.length === 0}
              indeterminate={selectedOnPage > 0 && !allOnPage}
              onChange={(event) => togglePage(event.target.checked)}
            />
            Select all {items.length} on this page
          </label>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div
                aria-label="Loading memberships"
                className="h-48 animate-pulse bg-accent/40"
              />
            ) : items.length ? (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-start gap-3 px-1 py-3 hover:bg-accent/10">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onChange={(event) =>
                          toggle(item.id, event.target.checked)
                        }
                      />
                      <span className="min-w-0 text-sm">
                        <span className="block font-semibold">
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span className="block truncate text-muted-foreground">
                            {item.subtitle}
                          </span>
                        ) : null}
                        {item.detail ? (
                          <span className="block text-xs capitalize text-muted-foreground">
                            {item.detail}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page} of {pageCount}
            </span>
            <div className="flex gap-2">
              <Button
                disabled={page <= 1 || loading}
                onClick={() => onPageChange(page - 1)}
                size="sm"
                variant="outline"
              >
                Previous
              </Button>
              <Button
                disabled={page >= pageCount || loading}
                onClick={() => onPageChange(page + 1)}
                size="sm"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <footer className="border-t border-border p-5">
          {error ? (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {changeCount} changes pending
            </span>
            <div className="flex gap-2">
              <Button
                disabled={pending}
                onClick={() => onOpenChange(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={pending || changeCount === 0}
                onClick={() => onSave(changes)}
              >
                {pending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
