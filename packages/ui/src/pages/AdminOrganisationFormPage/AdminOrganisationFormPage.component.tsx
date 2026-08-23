'use client';

import { useState, type FormEvent } from 'react';

import { OrganisationStatus } from '@hektor/types';

import { Button, Input, buttonVariants } from '../../atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/Select';
import { NavigationLink } from '../../context';

export interface OrganisationFormValues {
  name: string;
  slug: string;
  status: OrganisationStatus;
}

export interface AdminOrganisationFormPageProps {
  cancelHref: string;
  error?: string;
  initialValues?: OrganisationFormValues;
  mode: 'create' | 'edit';
  onSubmit: (values: OrganisationFormValues) => void;
  pending?: boolean;
}

const emptyValues: OrganisationFormValues = {
  name: '',
  slug: '',
  status: OrganisationStatus.Active,
};

function slugify(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}

export function AdminOrganisationFormPage({
  cancelHref,
  error,
  initialValues = emptyValues,
  mode,
  onSubmit,
  pending,
}: AdminOrganisationFormPageProps) {
  const [values, setValues] = useState(initialValues);
  const [slugEdited, setSlugEdited] = useState(Boolean(initialValues.slug));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ ...values, name: values.name.trim(), slug: values.slug.trim() });
  };

  return (
    <div className="max-w-2xl">
      <header>
        <p className="text-sm font-semibold text-primary">Organisation</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {mode === 'create' ? 'Create organisation' : 'Edit organisation'}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Configure the organisation identity and platform lifecycle status.
        </p>
      </header>

      <form className="mt-8 space-y-6" onSubmit={submit}>
        <label className="block text-sm font-semibold">
          Name
          <Input
            className="mt-2"
            disabled={pending}
            maxLength={255}
            onChange={(event) => {
              const name = event.target.value;
              setValues((current) => ({
                ...current,
                name,
                ...(!slugEdited ? { slug: slugify(name) } : {}),
              }));
            }}
            required
            value={values.name}
          />
        </label>

        <label className="block text-sm font-semibold">
          Slug
          <Input
            className="mt-2 font-mono"
            disabled={pending}
            maxLength={255}
            onChange={(event) => {
              setSlugEdited(true);
              setValues((current) => ({
                ...current,
                slug: event.target.value.toLocaleLowerCase(),
              }));
            }}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
            value={values.slug}
          />
          <span className="mt-2 block font-normal text-muted-foreground">
            Lowercase letters, numbers and single hyphens only.
          </span>
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
                {Object.values(OrganisationStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className="capitalize">{status}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {values.status === OrganisationStatus.Archived ? (
              <span className="mt-2 block font-normal text-muted-foreground">
                Archived organisations are hidden from the current directory and
                cannot provide access or accept invitations.
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
                ? 'Create organisation'
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
