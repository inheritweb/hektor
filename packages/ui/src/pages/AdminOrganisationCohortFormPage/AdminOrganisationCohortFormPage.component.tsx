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

export interface OrganisationCohortFormValues {
  endsOn: string;
  name: string;
  startsOn: string;
  status: GroupStatus;
}

export interface AdminOrganisationCohortFormPageProps {
  cancelHref: string;
  error?: string;
  initialValues?: OrganisationCohortFormValues;
  mode: 'create' | 'edit';
  onSubmit: (values: OrganisationCohortFormValues) => void;
  pending?: boolean;
}

const emptyValues: OrganisationCohortFormValues = {
  endsOn: '',
  name: '',
  startsOn: '',
  status: GroupStatus.Active,
};

export function AdminOrganisationCohortFormPage({
  cancelHref,
  error,
  initialValues = emptyValues,
  mode,
  onSubmit,
  pending,
}: AdminOrganisationCohortFormPageProps) {
  const [values, setValues] = useState(initialValues);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ ...values, name: values.name.trim() });
  };

  return (
    <div className="max-w-2xl">
      <header>
        <p className="text-sm font-semibold text-primary">Cohort</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {mode === 'create' ? 'Create cohort' : 'Edit cohort'}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Configure the cohort identity, dates and lifecycle status.
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
              setValues((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
            value={values.name}
          />
        </label>

        <label className="block text-sm font-semibold">
          Starts on
          <Input
            className="mt-2"
            disabled={pending}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                startsOn: event.target.value,
              }))
            }
            required
            type="date"
            value={values.startsOn}
          />
        </label>

        <label className="block text-sm font-semibold">
          Ends on
          <Input
            className="mt-2"
            disabled={pending}
            min={values.startsOn || undefined}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                endsOn: event.target.value,
              }))
            }
            required
            type="date"
            value={values.endsOn}
          />
        </label>

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
                Archived cohorts remain available for historical reporting and
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
                ? 'Create cohort'
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
