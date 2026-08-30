'use client';

import { useEffect, useState } from 'react';
import {
  OrganisationProvisionImportAction,
  OrganisationRole,
  TenantOrganisationProvisionImportAction,
  type OrganisationProvisionImportPreview,
  type OrganisationProvisionImportResult,
  type OrganisationProvisionImportRow,
  type TenantOrganisationProvisionImportPreview,
  type TenantOrganisationProvisionImportResult,
} from '@hektor/types';

import {
  Button,
  Checkbox,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '../../atoms';

export interface OrganisationProvisionImportSheetProps {
  error?: string;
  onCommit: (options: {
    rows: OrganisationProvisionImportRow[];
    sendInvitations: boolean;
  }) => void;
  onOpenChange: (open: boolean) => void;
  onPreview: (rows: OrganisationProvisionImportRow[]) => void;
  open: boolean;
  pending?: boolean;
  preview?:
    | OrganisationProvisionImportPreview
    | TenantOrganisationProvisionImportPreview;
  privacyMode?: boolean;
  result?:
    OrganisationProvisionImportResult | TenantOrganisationProvisionImportResult;
}

export function OrganisationProvisionImportSheet(
  props: OrganisationProvisionImportSheetProps,
) {
  const [rows, setRows] = useState<OrganisationProvisionImportRow[]>([]);
  const [parseError, setParseError] = useState<string>();
  const [sendInvitations, setSendInvitations] = useState(false);

  useEffect(() => {
    if (props.open) {
      setRows([]);
      setParseError(undefined);
      setSendInvitations(false);
    }
  }, [props.open]);

  const readFile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = parseProvisionCsv(await file.text());
      setRows(parsed);
      setParseError(undefined);
      props.onPreview(parsed);
    } catch (error) {
      setRows([]);
      setParseError(
        error instanceof Error ? error.message : 'Unable to read CSV',
      );
    }
  };

  return (
    <Sheet onOpenChange={props.onOpenChange} open={props.open}>
      <SheetContent className="w-[min(52rem,96vw)]">
        <header className="border-b border-border px-5 py-5 pr-12">
          <SheetTitle>Import provisioned users</SheetTitle>
          <SheetDescription className="mt-1">
            {props.privacyMode
              ? 'Preview a CSV before preparing organisation access.'
              : 'Preview a CSV before creating provisioned users or connecting existing Hektor users.'}
          </SheetDescription>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {!props.result ? (
            <>
              <div className="rounded-lg border border-border bg-background p-4 text-sm">
                <p className="font-semibold">CSV columns</p>
                <code className="mt-2 block text-xs text-muted-foreground">
                  first_name,last_name,email,role,cohort
                </code>
                <p className="mt-2 text-xs text-muted-foreground">
                  Role must be learner, tutor, or org_admin. Cohort is optional
                  and matched by name.
                </p>
              </div>
              <label className="block text-sm font-semibold">
                CSV file
                <Input
                  accept=".csv,text/csv"
                  className="mt-2 cursor-pointer py-2"
                  disabled={props.pending}
                  onChange={(event) => void readFile(event.target.files?.[0])}
                  type="file"
                />
              </label>
              {props.preview ? (
                <>
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <Summary
                      label="Ready"
                      value={props.preview.summary.ready}
                    />
                    <Summary
                      label="Unchanged"
                      value={props.preview.summary.unchanged}
                    />
                    <Summary
                      label="Errors"
                      value={props.preview.summary.errors}
                    />
                  </div>
                  <div className="overflow-x-auto border-y border-border">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs text-muted-foreground">
                        <tr>
                          <th className="px-2 py-2">Row</th>
                          <th className="px-2 py-2">User</th>
                          <th className="px-2 py-2">Role</th>
                          <th className="px-2 py-2">Outcome</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {props.preview.rows.map((row) => (
                          <tr key={`${row.rowNumber}-${row.email}`}>
                            <td className="px-2 py-2 text-muted-foreground">
                              {row.rowNumber}
                            </td>
                            <td className="px-2 py-2">
                              <span className="block font-medium">
                                {row.firstName} {row.lastName}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {row.email}
                              </span>
                            </td>
                            <td className="px-2 py-2 capitalize">
                              {row.role.replaceAll('_', ' ')}
                            </td>
                            <td
                              className={`px-2 py-2 ${
                                isInvalidAction(row.action)
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {row.message ?? row.action.replaceAll('_', ' ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <Checkbox
                      checked={sendInvitations}
                      disabled={props.pending}
                      onChange={(event) =>
                        setSendInvitations(event.target.checked)
                      }
                    />
                    <span>
                      <span className="block font-semibold">
                        Send invitations after import
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Invitations are sent where an invitation is required.
                      </span>
                    </span>
                  </label>
                </>
              ) : null}
            </>
          ) : (
            <div className="rounded-lg border border-border bg-background p-5">
              <h3 className="font-semibold">Import complete</h3>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                {'processed' in props.result ? (
                  <Result label="Processed" value={props.result.processed} />
                ) : (
                  <>
                    <Result
                      label="Provisioned users created"
                      value={props.result.created}
                    />
                    <Result label="Users linked" value={props.result.linked} />
                    <Result
                      label="Invitations sent"
                      value={props.result.invitationsSent}
                    />
                    {props.result.invitationsFailed ? (
                      <Result
                        label="Invitations failed"
                        value={props.result.invitationsFailed}
                      />
                    ) : null}
                  </>
                )}
                <Result label="Unchanged" value={props.result.unchanged} />
              </dl>
            </div>
          )}
        </div>
        <footer className="border-t border-border p-5">
          {parseError || props.error ? (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {parseError ?? props.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              disabled={props.pending}
              onClick={() => props.onOpenChange(false)}
              variant="outline"
            >
              {props.result ? 'Close' : 'Cancel'}
            </Button>
            {!props.result ? (
              <Button
                disabled={
                  props.pending ||
                  !props.preview ||
                  props.preview.summary.errors > 0 ||
                  props.preview.summary.ready === 0
                }
                onClick={() => props.onCommit({ rows, sendInvitations })}
              >
                {props.pending ? 'Importing…' : 'Import users'}
              </Button>
            ) : null}
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function isInvalidAction(
  action:
    OrganisationProvisionImportAction | TenantOrganisationProvisionImportAction,
) {
  return (
    action === OrganisationProvisionImportAction.Invalid ||
    action === TenantOrganisationProvisionImportAction.Invalid
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-accent/15 p-3">
      <strong className="block text-lg">{value}</strong>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function Result({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  );
}

export function parseProvisionCsv(
  csv: string,
): OrganisationProvisionImportRow[] {
  const records = parseCsvRecords(csv.replace(/^\uFEFF/, ''));
  if (records.length < 2) throw new Error('The CSV contains no user rows');
  const headers = records[0]!.map((value) => value.trim().toLocaleLowerCase());
  const required = ['first_name', 'last_name', 'email', 'role'];
  for (const header of required) {
    if (!headers.includes(header)) throw new Error(`Missing column: ${header}`);
  }
  const valueAt = (record: string[], name: string) =>
    record[headers.indexOf(name)]?.trim() ?? '';
  const rows = records.slice(1).filter((record) => record.some(Boolean));
  if (rows.length > 500) throw new Error('A CSV can contain at most 500 users');

  return rows.map((record, index) => {
    const role = valueAt(record, 'role').toLocaleLowerCase();
    if (!Object.values(OrganisationRole).includes(role as OrganisationRole)) {
      throw new Error(
        `Row ${index + 2} has an invalid role: ${role || 'blank'}`,
      );
    }
    const firstName = valueAt(record, 'first_name');
    const lastName = valueAt(record, 'last_name');
    const email = valueAt(record, 'email').toLocaleLowerCase();
    if (!firstName || !lastName || !email) {
      throw new Error(`Row ${index + 2} has a blank required value`);
    }
    return {
      cohortName: valueAt(record, 'cohort') || undefined,
      email,
      firstName,
      lastName,
      role: role as OrganisationRole,
      rowNumber: index + 2,
    };
  });
}

function parseCsvRecords(csv: string) {
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]!;
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === ',' && !quoted) {
      record.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && csv[index + 1] === '\n') index += 1;
      record.push(field);
      if (record.some((value) => value.length > 0)) records.push(record);
      record = [];
      field = '';
    } else field += character;
  }
  if (quoted) throw new Error('The CSV contains an unclosed quoted value');
  record.push(field);
  if (record.some((value) => value.length > 0)) records.push(record);
  return records;
}
