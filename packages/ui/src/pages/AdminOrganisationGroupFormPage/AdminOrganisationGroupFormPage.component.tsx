'use client';

import { useState, type FormEvent } from 'react';

import { GroupStatus } from '@hektor/types';

import { Button, Input, buttonVariants } from '../../atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/Select';
import { NavigationLink } from '../../context';

export interface OrganisationGroupFormValues {
  cohortId?: string;
  name: string;
  status: GroupStatus;
}

export interface AdminOrganisationGroupFormPageProps {
  cancelHref: string;
  cohorts: readonly { id: string; name: string }[];
  error?: string;
  initialValues?: OrganisationGroupFormValues;
  mode: 'create' | 'edit';
  onSubmit: (values: OrganisationGroupFormValues) => void;
  pending?: boolean;
  source?: { externalId?: string; method: string };
}

const noCohort = '__none__';

const emptyValues: OrganisationGroupFormValues = {
  name: '',
  status: GroupStatus.Active,
};

export function AdminOrganisationGroupFormPage({
  cancelHref,
  cohorts,
  error,
  initialValues = emptyValues,
  mode,
  onSubmit,
  pending,
  source,
}: AdminOrganisationGroupFormPageProps) {
  const [values, setValues] = useState(initialValues);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ ...values, name: values.name.trim() });
  };

  return (
    <div className="max-w-2xl">
      <header>
        <p className="text-sm font-semibold text-primary">Group</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {mode === 'create' ? 'Create group' : 'Edit group'}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Configure the group identity, cohort and lifecycle status.
        </p>
      </header>

      <form className="mt-8 space-y-6" onSubmit={submit}>
        <label className="block text-sm font-semibold">
          Name
          <Input
            className="mt-2"
            disabled={pending}
            maxLength={255}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            required
            value={values.name}
          />
        </label>

        <label className="block text-sm font-semibold">
          Cohort
          <Select
            disabled={pending}
            onValueChange={(cohortId) =>
              setValues((current) => ({
                ...current,
                cohortId:
                  !cohortId || cohortId === noCohort ? undefined : cohortId,
              }))
            }
            value={values.cohortId ?? noCohort}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={noCohort}>No cohort</SelectItem>
              {cohorts.map((cohort) => (
                <SelectItem key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {source ? (
          <div className="text-sm">
            <p className="font-semibold">Managed by</p>
            <p className="mt-2 text-muted-foreground">
              {source.method.toUpperCase()}
              {source.externalId ? ` · ${source.externalId}` : ''}
            </p>
            <p className="mt-1 text-muted-foreground">
              Source metadata is controlled by the provisioning system.
            </p>
          </div>
        ) : null}

        {mode === 'edit' ? (
          <label className="block text-sm font-semibold">
            Status
            <Select
              disabled={pending}
              onValueChange={(status) => {
                if (status) setValues((current) => ({ ...current, status }));
              }}
              value={values.status}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(GroupStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className="capitalize">{status}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {values.status === GroupStatus.Archived ? (
              <span className="mt-2 block font-normal text-muted-foreground">
                Archived groups remain available for historical reporting and
                can be reactivated later.
              </span>
            ) : null}
          </label>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex gap-2">
          <Button disabled={pending} type="submit">
            {pending
              ? 'Saving…'
              : mode === 'create'
                ? 'Create group'
                : 'Save changes'}
          </Button>
          <NavigationLink
            className={buttonVariants({ variant: 'outline' })}
            href={cancelHref}
          >
            Cancel
          </NavigationLink>
        </div>
      </form>
    </div>
  );
}
