'use client';

import { useEffect, useState } from 'react';
import { OrganisationRole } from '@hektor/types';

import {
  Button,
  Checkbox,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '../../atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/Select';

export interface OrganisationMembershipCandidateItem {
  id: string;
  title: string;
  email?: string;
  pendingProvisionRole?: OrganisationRole;
}

export interface OrganisationMembershipCreateValues {
  cohortId?: string;
  role: OrganisationRole;
  userIds: string[];
}

export interface OrganisationMembershipCreateSheetProps {
  candidates: readonly OrganisationMembershipCandidateItem[];
  cohorts: readonly { id: string; name: string }[];
  error?: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onPageChange: (page: number) => void;
  onSave: (values: OrganisationMembershipCreateValues) => void;
  onSearchChange: (query: string) => void;
  open: boolean;
  page: number;
  pageSize: number;
  pending?: boolean;
  search: string;
  totalRecords: number;
}

export function OrganisationMembershipCreateSheet(
  props: OrganisationMembershipCreateSheetProps,
) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [role, setRole] = useState(OrganisationRole.Learner);
  const [cohortId, setCohortId] = useState<string>();

  useEffect(() => {
    if (props.open) {
      setSelectedIds(new Set());
      setRole(OrganisationRole.Learner);
      setCohortId(undefined);
    }
  }, [props.open]);

  const pageIds = props.candidates.map(({ id }) => id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length;
  const allOnPage = pageIds.length > 0 && selectedOnPage === pageIds.length;
  const pageCount = Math.max(1, Math.ceil(props.totalRecords / props.pageSize));
  const toggle = (id: string, checked: boolean) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const togglePage = (checked: boolean) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of pageIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  return (
    <Sheet onOpenChange={props.onOpenChange} open={props.open}>
      <SheetContent className="w-[min(42rem,95vw)]">
        <header className="border-b border-border px-5 py-5 pr-12">
          <SheetTitle>Connect users</SheetTitle>
          <SheetDescription className="mt-1">
            Select existing Hektor users and configure their organisation
            membership.
          </SheetDescription>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Role
              <Select
                value={role}
                onValueChange={(value) => value && setRole(value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue>{role.replaceAll('_', ' ')}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrganisationRole).map((value) => (
                    <SelectItem key={value} value={value}>
                      <span className="capitalize">
                        {value.replaceAll('_', ' ')}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="text-sm font-semibold">
              Cohort
              <Select
                value={cohortId ?? 'none'}
                onValueChange={(value) =>
                  setCohortId(!value || value === 'none' ? undefined : value)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue>
                    {cohortId
                      ? (props.cohorts.find(({ id }) => id === cohortId)
                          ?.name ?? 'Choose cohort')
                      : 'No cohort'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No cohort</SelectItem>
                  {props.cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            A matching pending provision takes precedence over the role and
            cohort selected here.
          </p>
          <Input
            aria-label="Search users"
            onChange={(event) => props.onSearchChange(event.target.value)}
            placeholder="Search by name or email"
            type="search"
            value={props.search}
          />
          <label className="flex items-center gap-3 border-b border-border pb-3 text-sm font-semibold">
            <Checkbox
              checked={allOnPage}
              disabled={props.loading || !pageIds.length}
              indeterminate={selectedOnPage > 0 && !allOnPage}
              onChange={(event) => togglePage(event.target.checked)}
            />
            Select all {pageIds.length} on this page
          </label>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {props.loading ? (
              <div
                aria-label="Loading users"
                className="h-48 animate-pulse bg-accent/40"
              />
            ) : props.candidates.length ? (
              <ul className="divide-y divide-border">
                {props.candidates.map((candidate) => (
                  <li key={candidate.id}>
                    <label className="flex cursor-pointer items-start gap-3 px-1 py-3 hover:bg-accent/10">
                      <Checkbox
                        checked={selectedIds.has(candidate.id)}
                        onChange={(event) =>
                          toggle(candidate.id, event.target.checked)
                        }
                      />
                      <span className="min-w-0 text-sm">
                        <span className="block font-semibold text-foreground">
                          {candidate.title || candidate.email || 'Unnamed user'}
                        </span>
                        {candidate.email ? (
                          <span className="block truncate text-muted-foreground">
                            {candidate.email}
                          </span>
                        ) : null}
                        {candidate.pendingProvisionRole ? (
                          <span className="block text-xs text-primary">
                            Pending provision ·{' '}
                            {candidate.pendingProvisionRole.replaceAll(
                              '_',
                              ' ',
                            )}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No eligible users match this search.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {props.page} of {pageCount}
            </span>
            <div className="flex gap-2">
              <Button
                disabled={props.page <= 1 || props.loading}
                onClick={() => props.onPageChange(props.page - 1)}
                size="sm"
                variant="outline"
              >
                Previous
              </Button>
              <Button
                disabled={props.page >= pageCount || props.loading}
                onClick={() => props.onPageChange(props.page + 1)}
                size="sm"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
        <footer className="border-t border-border p-5">
          {props.error ? (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {props.error}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <div className="flex gap-2">
              <Button
                disabled={props.pending}
                onClick={() => props.onOpenChange(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={props.pending || !selectedIds.size}
                onClick={() =>
                  props.onSave({ cohortId, role, userIds: [...selectedIds] })
                }
              >
                {props.pending ? 'Connecting…' : 'Connect users'}
              </Button>
            </div>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
