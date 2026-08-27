'use client';

import { useEffect, useState } from 'react';
import {
  OrganisationRole,
  ProvisioningMethod,
  type OrganisationBulkInvitationResult,
} from '@hektor/types';

import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '../../atoms';

export interface OrganisationInvitationCandidate {
  email: string;
  id: string;
  invitationExpiresAt?: string;
  invitationSentAt?: string;
  name: string;
  provisioningMethod: ProvisioningMethod;
  role: OrganisationRole;
}

export interface OrganisationInvitationManagerSheetProps {
  candidates: readonly OrganisationInvitationCandidate[];
  error?: string;
  loading?: boolean;
  method?: ProvisioningMethod;
  onFilterChange: (filter: {
    method?: ProvisioningMethod;
    query: string;
    role?: OrganisationRole;
  }) => void;
  onOpenChange: (open: boolean) => void;
  onPageChange: (page: number) => void;
  onSend: (selection: { ids?: string[]; selectAllMatching: boolean }) => void;
  open: boolean;
  page: number;
  pageSize: number;
  pending?: boolean;
  query: string;
  result?: OrganisationBulkInvitationResult;
  role?: OrganisationRole;
  totalRecords: number;
}

export function OrganisationInvitationManagerSheet(
  props: OrganisationInvitationManagerSheetProps,
) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllMatching, setSelectAllMatching] = useState(false);

  useEffect(() => {
    if (props.open) {
      setSelectedIds(new Set());
      setSelectAllMatching(false);
    }
  }, [props.open]);

  const pageIds = props.candidates.map(({ id }) => id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length;
  const allOnPage = pageIds.length > 0 && selectedOnPage === pageIds.length;
  const recipientCount = selectAllMatching
    ? props.totalRecords
    : selectedIds.size;
  const pageCount = Math.max(1, Math.ceil(props.totalRecords / props.pageSize));
  const changeFilter = (filter: {
    method?: ProvisioningMethod;
    query: string;
    role?: OrganisationRole;
  }) => {
    setSelectedIds(new Set());
    setSelectAllMatching(false);
    props.onFilterChange(filter);
  };

  return (
    <Sheet onOpenChange={props.onOpenChange} open={props.open}>
      <SheetContent className="w-[min(48rem,96vw)]">
        <header className="border-b border-border px-5 py-5 pr-12">
          <SheetTitle>Manage invitations</SheetTitle>
          <SheetDescription className="mt-1">
            Send or resend invitations for pending provisioned users.
          </SheetDescription>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          {!props.result ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  aria-label="Search provisioned users"
                  onChange={(event) =>
                    changeFilter({
                      method: props.method,
                      query: event.target.value,
                      role: props.role,
                    })
                  }
                  placeholder="Search name or email"
                  type="search"
                  value={props.query}
                />
                <Select
                  onValueChange={(value) =>
                    changeFilter({
                      method: props.method,
                      query: props.query,
                      role:
                        !value || value === 'all'
                          ? undefined
                          : (value as OrganisationRole),
                    })
                  }
                  value={props.role ?? 'all'}
                >
                  <SelectTrigger aria-label="Filter by role">
                    <SelectValue>
                      {props.role
                        ? props.role.replaceAll('_', ' ')
                        : 'All roles'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    {Object.values(OrganisationRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        <span className="capitalize">
                          {role.replaceAll('_', ' ')}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(value) =>
                    changeFilter({
                      method:
                        !value || value === 'all'
                          ? undefined
                          : (value as ProvisioningMethod),
                      query: props.query,
                      role: props.role,
                    })
                  }
                  value={props.method ?? 'all'}
                >
                  <SelectTrigger aria-label="Filter by method">
                    <SelectValue>
                      {props.method?.toUpperCase() ?? 'All methods'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    {Object.values(ProvisioningMethod).map((method) => (
                      <SelectItem key={method} value={method}>
                        {method.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-3 border-b border-border pb-3 text-sm font-semibold">
                <Checkbox
                  checked={selectAllMatching || allOnPage}
                  disabled={props.loading || !props.totalRecords}
                  indeterminate={
                    !selectAllMatching && selectedOnPage > 0 && !allOnPage
                  }
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setSelectAllMatching(false);
                    setSelectedIds((current) => {
                      const next = new Set(current);
                      for (const id of pageIds) {
                        if (checked) next.add(id);
                        else next.delete(id);
                      }
                      return next;
                    });
                  }}
                />
                Select all on this page
              </label>
              {allOnPage && props.totalRecords > pageIds.length ? (
                <Button
                  className="h-auto justify-start px-0"
                  onClick={() => {
                    setSelectedIds(new Set());
                    setSelectAllMatching(true);
                  }}
                  variant="link"
                >
                  Select all {props.totalRecords} matching provisioned users
                </Button>
              ) : null}
              {selectAllMatching ? (
                <p className="rounded-lg bg-accent/20 p-3 text-sm">
                  All {props.totalRecords} matching provisioned users are
                  selected.
                </p>
              ) : null}
              <div className="min-h-0 flex-1 overflow-y-auto">
                {props.loading ? (
                  <div className="h-48 animate-pulse bg-accent/30" />
                ) : props.candidates.length ? (
                  <ul className="divide-y divide-border">
                    {props.candidates.map((candidate) => (
                      <li key={candidate.id}>
                        <label className="flex cursor-pointer items-start gap-3 px-1 py-3 hover:bg-accent/10">
                          <Checkbox
                            checked={
                              selectAllMatching || selectedIds.has(candidate.id)
                            }
                            disabled={selectAllMatching}
                            onChange={(event) =>
                              setSelectedIds((current) => {
                                const next = new Set(current);
                                if (event.target.checked)
                                  next.add(candidate.id);
                                else next.delete(candidate.id);
                                return next;
                              })
                            }
                          />
                          <span className="min-w-0 flex-1 text-sm">
                            <span className="block font-semibold">
                              {candidate.name}
                            </span>
                            <span className="block truncate text-muted-foreground">
                              {candidate.email}
                            </span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {invitationState(candidate)}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No pending provisioned users match these filters.
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
            </>
          ) : (
            <div className="rounded-lg border border-border p-5 text-sm">
              <h3 className="font-semibold">Invitation run complete</h3>
              <p className="mt-3">
                {props.result.sent} sent · {props.result.skipped} skipped ·{' '}
                {props.result.failed} failed
              </p>
              {props.result.items.some(({ message }) => message) ? (
                <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-xs">
                  {props.result.items
                    .filter(({ message }) => message)
                    .map((item) => (
                      <li key={item.provisionId}>
                        <strong>{item.email ?? item.provisionId}</strong> —{' '}
                        {item.message}
                      </li>
                    ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
        <footer className="border-t border-border p-5">
          {props.error ? (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {props.error}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {props.result ? null : `${recipientCount} selected`}
            </span>
            <div className="flex gap-2">
              <Button
                disabled={props.pending}
                onClick={() => props.onOpenChange(false)}
                variant="outline"
              >
                {props.result ? 'Close' : 'Cancel'}
              </Button>
              {!props.result ? (
                <Button
                  disabled={!recipientCount || props.pending}
                  onClick={() =>
                    props.onSend({
                      ids: selectAllMatching
                        ? undefined
                        : Array.from(selectedIds),
                      selectAllMatching,
                    })
                  }
                >
                  {props.pending
                    ? 'Sending…'
                    : `Send ${recipientCount} invitation${recipientCount === 1 ? '' : 's'}`}
                </Button>
              ) : null}
            </div>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function invitationState(candidate: OrganisationInvitationCandidate) {
  if (!candidate.invitationSentAt) return 'Never invited';
  if (
    candidate.invitationExpiresAt &&
    new Date(candidate.invitationExpiresAt).getTime() <= Date.now()
  )
    return 'Expired';
  return 'Invitation active';
}
