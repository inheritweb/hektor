'use client';

import { useState, type FormEvent } from 'react';
import { PlatformRole } from '@hektor/types';

import { Button, Checkbox, Input, buttonVariants } from '../../atoms';
import { NavigationLink } from '../../context';

export interface AdminUserFormValues {
  email: string;
  firstName: string;
  lastName: string;
  platformRole?: PlatformRole;
}

export interface AdminUserFormPageProps {
  cancelHref: string;
  error?: string;
  onSubmit: (values: AdminUserFormValues) => void;
  pending?: boolean;
}

export function AdminUserFormPage({
  cancelHref,
  error,
  onSubmit,
  pending,
}: AdminUserFormPageProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [platformAdmin, setPlatformAdmin] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      platformRole: platformAdmin ? PlatformRole.Admin : undefined,
    });
  };

  return (
    <div className="max-w-2xl">
      <header>
        <p className="text-sm font-semibold text-primary">Platform user</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Add user</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Create a canonical Hektor account. Organisation connections are
          managed separately.
        </p>
      </header>
      <form className="mt-8 space-y-6" onSubmit={submit}>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            First name
            <Input
              className="mt-2"
              disabled={pending}
              maxLength={100}
              onChange={(event) => setFirstName(event.target.value)}
              required
              value={firstName}
            />
          </label>
          <label className="block text-sm font-semibold">
            Last name
            <Input
              className="mt-2"
              disabled={pending}
              maxLength={100}
              onChange={(event) => setLastName(event.target.value)}
              required
              value={lastName}
            />
          </label>
        </div>
        <label className="block text-sm font-semibold">
          Email address
          <Input
            className="mt-2"
            disabled={pending}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <Checkbox
            checked={platformAdmin}
            disabled={pending}
            onChange={(event) => setPlatformAdmin(event.target.checked)}
          />
          Platform administrator
        </label>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button disabled={pending} type="submit">
            {pending ? 'Adding…' : 'Add user'}
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
