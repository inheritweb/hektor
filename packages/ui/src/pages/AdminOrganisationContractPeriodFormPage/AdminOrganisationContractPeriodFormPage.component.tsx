'use client';

import { useState, type FormEvent } from 'react';

import { Button, Input, buttonVariants } from '../../atoms';
import { NavigationLink } from '../../context';

export interface OrganisationContractPeriodFormValues {
  endsOn: string;
  learnerSeatAllowance: number;
  startsOn: string;
}

export interface AdminOrganisationContractPeriodFormPageProps {
  activatedSeats?: number;
  cancelHref: string;
  error?: string;
  initialValues?: OrganisationContractPeriodFormValues;
  mode: 'create' | 'edit';
  onSubmit: (values: OrganisationContractPeriodFormValues) => void;
  pending?: boolean;
}

const emptyValues: OrganisationContractPeriodFormValues = {
  endsOn: '',
  learnerSeatAllowance: 0,
  startsOn: '',
};

export function AdminOrganisationContractPeriodFormPage({
  activatedSeats = 0,
  cancelHref,
  error,
  initialValues = emptyValues,
  mode,
  onSubmit,
  pending,
}: AdminOrganisationContractPeriodFormPageProps) {
  const [values, setValues] = useState(initialValues);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="max-w-2xl">
      <header>
        <p className="text-sm font-semibold text-primary">Contract period</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {mode === 'create'
            ? 'Create contract period'
            : 'Edit contract period'}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Set the period dates and the number of learner seats available.
        </p>
      </header>

      <form className="mt-8 space-y-6" onSubmit={submit}>
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
          <span className="mt-2 block font-normal text-muted-foreground">
            The end date is exclusive; the next period may begin on this date.
          </span>
        </label>

        <label className="block text-sm font-semibold">
          Learner seat allowance
          <Input
            className="mt-2"
            disabled={pending}
            min={activatedSeats}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                learnerSeatAllowance: event.target.valueAsNumber,
              }))
            }
            required
            type="number"
            value={values.learnerSeatAllowance}
          />
          {mode === 'edit' ? (
            <span className="mt-2 block font-normal text-muted-foreground">
              {activatedSeats} learner seats are currently activated.
            </span>
          ) : null}
        </label>

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
                ? 'Create contract period'
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
