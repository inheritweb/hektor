'use client';

import { useState, type FormEvent } from 'react';
import { OrganisationRole, OrganisationUserStatus } from '@hektor/types';

import { Button, buttonVariants } from '../../atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/Select';
import { NavigationLink } from '../../context';

export interface OrganisationMembershipFormValues {
  cohortId?: string;
  role: OrganisationRole;
  status: OrganisationUserStatus;
}

export interface AdminOrganisationMembershipFormPageProps {
  cancelHref: string;
  cohorts: readonly { id: string; name: string }[];
  error?: string;
  initialValues: OrganisationMembershipFormValues;
  onSubmit: (values: OrganisationMembershipFormValues) => void;
  pending?: boolean;
  provisionControlled?: boolean;
  userName: string;
}

export function AdminOrganisationMembershipFormPage(
  props: AdminOrganisationMembershipFormPageProps,
) {
  const [values, setValues] = useState(props.initialValues);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit(values);
  };

  return (
    <div className="max-w-2xl">
      <header>
        <p className="text-sm font-semibold text-primary">Organisation user</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Edit {props.userName}
        </h1>
        {props.provisionControlled ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Role and cohort are controlled by the active provision. Status
            changes also update that provision.
          </p>
        ) : null}
      </header>
      <form className="mt-8 space-y-6" onSubmit={submit}>
        <label className="block text-sm font-semibold">
          Role
          <Select
            disabled={props.pending || props.provisionControlled}
            value={values.role}
            onValueChange={(role) => role && setValues((v) => ({ ...v, role }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
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
        <label className="block text-sm font-semibold">
          Cohort
          <Select
            disabled={props.pending || props.provisionControlled}
            value={values.cohortId ?? 'none'}
            onValueChange={(cohortId) =>
              cohortId &&
              setValues((v) => ({
                ...v,
                cohortId: cohortId === 'none' ? undefined : cohortId,
              }))
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
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
        <label className="block text-sm font-semibold">
          Status
          <Select
            disabled={props.pending}
            value={values.status}
            onValueChange={(status) =>
              status && setValues((v) => ({ ...v, status }))
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(OrganisationUserStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  <span className="capitalize">{status}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        {props.error ? (
          <p className="text-sm text-destructive" role="alert">
            {props.error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button disabled={props.pending} type="submit">
            {props.pending ? 'Saving…' : 'Save changes'}
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
