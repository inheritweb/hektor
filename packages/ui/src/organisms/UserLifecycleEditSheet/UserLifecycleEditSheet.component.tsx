'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { PlatformRole, UserStatus } from '@hektor/types';

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

export interface UserLifecycleEditValues {
  firstName: string;
  lastName: string;
  platformRole?: PlatformRole;
  status: UserStatus;
}

export interface UserLifecycleEditSheetProps {
  error?: string;
  initialValues: UserLifecycleEditValues;
  onOpenChange: (open: boolean) => void;
  onSave: (values: UserLifecycleEditValues) => void;
  open: boolean;
  pending?: boolean;
}

export function UserLifecycleEditSheet(props: UserLifecycleEditSheetProps) {
  const [values, setValues] = useState(props.initialValues);

  useEffect(() => {
    if (props.open) setValues(props.initialValues);
  }, [props.initialValues, props.open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSave({
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    });
  };

  return (
    <Sheet onOpenChange={props.onOpenChange} open={props.open}>
      <SheetContent className="w-[min(36rem,95vw)]">
        <header className="border-b border-border px-5 py-5 pr-12">
          <SheetTitle>Edit user</SheetTitle>
          <SheetDescription className="mt-1">
            Manage this account without changing its organisation memberships.
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
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                  required
                  value={values.firstName}
                />
              </label>
              <label className="text-sm font-semibold">
                Last name
                <Input
                  className="mt-2"
                  disabled={props.pending}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                  required
                  value={values.lastName}
                />
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Platform access
              <Select
                disabled={props.pending}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    platformRole:
                      value === 'personal' ? undefined : PlatformRole.Admin,
                  }))
                }
                value={values.platformRole ?? 'personal'}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue>
                    {values.platformRole === PlatformRole.Admin
                      ? 'Platform admin'
                      : 'Personal user'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal user</SelectItem>
                  <SelectItem value={PlatformRole.Admin}>
                    Platform admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="block text-sm font-semibold">
              Account status
              <Select
                disabled={props.pending}
                onValueChange={(value) =>
                  value &&
                  setValues((current) => ({ ...current, status: value }))
                }
                value={values.status}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue>
                    {values.status === UserStatus.Active
                      ? 'Active'
                      : 'Suspended'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserStatus.Active}>Active</SelectItem>
                  <SelectItem value={UserStatus.Suspended}>
                    Suspended
                  </SelectItem>
                </SelectContent>
              </Select>
            </label>
            <p className="text-sm text-muted-foreground">
              Suspended users cannot sign in. Their organisation memberships and
              seat assignments are preserved.
            </p>
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
              {props.pending ? 'Saving…' : 'Save changes'}
            </Button>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}
