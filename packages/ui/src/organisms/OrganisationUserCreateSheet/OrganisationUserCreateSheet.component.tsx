'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { OrganisationRole } from '@hektor/types';
import {
  Button,
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

export interface OrganisationUserCreateValues {
  cohortId?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: OrganisationRole;
}

export interface OrganisationUserCreateSheetProps {
  cohorts: readonly { id: string; name: string }[];
  error?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (values: OrganisationUserCreateValues) => void;
  open: boolean;
  pending?: boolean;
}

export function OrganisationUserCreateSheet(
  props: OrganisationUserCreateSheetProps,
) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(OrganisationRole.Learner);
  const [cohortId, setCohortId] = useState<string>();
  useEffect(() => {
    if (props.open) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole(OrganisationRole.Learner);
      setCohortId(undefined);
    }
  }, [props.open]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSave({
      cohortId,
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
    });
  };

  return (
    <Sheet onOpenChange={props.onOpenChange} open={props.open}>
      <SheetContent className="w-[min(36rem,95vw)]">
        <header className="border-b border-border px-5 py-5 pr-12">
          <SheetTitle>Add user</SheetTitle>
          <SheetDescription className="mt-1">
            Create a login-capable Hektor user and connect them to this
            organisation.
          </SheetDescription>
        </header>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                First name
                <Input
                  className="mt-2"
                  disabled={props.pending}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  value={firstName}
                />
              </label>
              <label className="text-sm font-semibold">
                Last name
                <Input
                  className="mt-2"
                  disabled={props.pending}
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
                disabled={props.pending}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label className="block text-sm font-semibold">
              Role
              <Select
                disabled={props.pending}
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
            <label className="block text-sm font-semibold">
              Cohort
              <Select
                disabled={props.pending}
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
            {props.error ? (
              <p className="text-sm text-destructive" role="alert">
                {props.error}
              </p>
            ) : null}
          </div>
          <footer className="flex justify-end gap-2 border-t border-border p-5">
            <Button
              disabled={props.pending}
              onClick={() => props.onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={props.pending} type="submit">
              {props.pending ? 'Adding…' : 'Add user'}
            </Button>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}
