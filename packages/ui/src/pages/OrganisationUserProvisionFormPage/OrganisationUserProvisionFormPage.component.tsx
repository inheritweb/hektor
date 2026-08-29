'use client';

import { useState, type FormEvent } from 'react';
import { OrganisationRole } from '@hektor/types';

import { Button, Checkbox, Input, buttonVariants } from '../../atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/Select';
import { NavigationLink } from '../../context';

export interface OrganisationUserProvisionFormValues {
  email: string;
  firstName: string;
  lastName: string;
  role: OrganisationRole;
  sendInvitation: boolean;
}

export interface OrganisationUserProvisionFormPageProps {
  cancelHref: string;
  error?: string;
  onSubmit: (values: OrganisationUserProvisionFormValues) => void;
  pending?: boolean;
}

export function OrganisationUserProvisionFormPage(
  props: OrganisationUserProvisionFormPageProps,
) {
  const [values, setValues] = useState<OrganisationUserProvisionFormValues>({
    email: '',
    firstName: '',
    lastName: '',
    role: OrganisationRole.Learner,
    sendInvitation: true,
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit({
      ...values,
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    });
  };

  return (
    <div className="max-w-2xl">
      <header>
        <p className="text-sm font-semibold text-primary">Provision</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Invite user</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Reserve an organisation place and invite this person to join. Hektor
          handles account reconciliation privately.
        </p>
      </header>
      <form className="mt-8 space-y-6" onSubmit={submit}>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            First name
            <Input
              className="mt-2"
              disabled={props.pending}
              maxLength={100}
              onChange={(event) =>
                setValues((value) => ({
                  ...value,
                  firstName: event.target.value,
                }))
              }
              required
              value={values.firstName}
            />
          </label>
          <label className="block text-sm font-semibold">
            Last name
            <Input
              className="mt-2"
              disabled={props.pending}
              maxLength={100}
              onChange={(event) =>
                setValues((value) => ({
                  ...value,
                  lastName: event.target.value,
                }))
              }
              required
              value={values.lastName}
            />
          </label>
        </div>
        <label className="block text-sm font-semibold">
          Email address
          <Input
            className="mt-2"
            disabled={props.pending}
            onChange={(event) =>
              setValues((value) => ({ ...value, email: event.target.value }))
            }
            required
            type="email"
            value={values.email}
          />
        </label>
        <label className="block text-sm font-semibold">
          Organisation role
          <Select
            disabled={props.pending}
            onValueChange={(role) =>
              role && setValues((value) => ({ ...value, role }))
            }
            value={values.role}
          >
            <SelectTrigger className="mt-2">
              <SelectValue>
                <span className="capitalize">
                  {values.role.replaceAll('_', ' ')}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(OrganisationRole).map((role) => (
                <SelectItem key={role} value={role}>
                  <span className="capitalize">
                    {role.replaceAll('_', ' ')}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <Checkbox
            checked={values.sendInvitation}
            disabled={props.pending}
            onChange={(event) =>
              setValues((value) => ({
                ...value,
                sendInvitation: event.target.checked,
              }))
            }
          />
          Send invitation now
        </label>
        {props.error ? (
          <p className="text-sm text-destructive" role="alert">
            {props.error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button disabled={props.pending} type="submit">
            {props.pending ? 'Inviting…' : 'Invite user'}
          </Button>
          <NavigationLink
            className={buttonVariants({ variant: 'outline' })}
            href={props.cancelHref}
          >
            Cancel
          </NavigationLink>
        </div>
      </form>
    </div>
  );
}
