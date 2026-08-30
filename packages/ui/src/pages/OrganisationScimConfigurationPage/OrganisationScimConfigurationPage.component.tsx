import {
  OrganisationRole,
  type OrganisationScimConfiguration,
} from '@hektor/types';

import { Button, Input } from '../../atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../atoms/Select';

export interface OrganisationScimConfigurationPageProps {
  configuration?: OrganisationScimConfiguration;
  defaultRole: OrganisationRole;
  endpoint: string;
  error?: string;
  issuedToken?: string;
  loading?: boolean;
  onDefaultRoleChange: (role: OrganisationRole) => void;
  onIssueToken: () => void;
  onRevokeToken: () => void;
  onSave: () => void;
  pending?: boolean;
}

export function OrganisationScimConfigurationPage(
  props: OrganisationScimConfigurationPageProps,
) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">SCIM provisioning</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your identity provider to provision and deactivate users.
        </p>
      </header>

      {props.error ? (
        <p className="text-sm text-destructive" role="alert">
          {props.error}
        </p>
      ) : null}

      <section className="space-y-4 rounded-xl border border-border p-5">
        <div>
          <h2 className="font-semibold">Connection</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use this base URL and bearer token in your identity provider.
          </p>
        </div>
        <label className="block text-sm font-semibold">
          SCIM base URL
          <Input className="mt-2 font-normal" readOnly value={props.endpoint} />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {props.loading
              ? 'Loading…'
              : props.configuration?.enabled
                ? `Active token ending ${props.configuration.tokenSuffix}`
                : 'No active token'}
          </span>
          <div className="flex gap-2">
            {props.configuration?.enabled ? (
              <Button
                disabled={props.pending}
                onClick={props.onRevokeToken}
                variant="outline"
              >
                Revoke token
              </Button>
            ) : null}
            <Button disabled={props.pending} onClick={props.onIssueToken}>
              {props.configuration?.enabled ? 'Rotate token' : 'Generate token'}
            </Button>
          </div>
        </div>
        {props.issuedToken ? (
          <div className="rounded-lg bg-accent/20 p-4">
            <p className="text-sm font-semibold">Copy this token now</p>
            <p className="mt-1 text-xs text-muted-foreground">
              For security, it will not be shown again.
            </p>
            <Input
              aria-label="New SCIM bearer token"
              className="mt-3 font-mono text-xs font-normal"
              readOnly
              value={props.issuedToken}
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border border-border p-5">
        <div>
          <h2 className="font-semibold">Provisioning defaults</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            New SCIM users receive this organisation role unless a later mapping
            provides something more specific.
          </p>
        </div>
        <label className="block text-sm font-semibold">
          Default role
          <Select
            onValueChange={(role) =>
              role && props.onDefaultRoleChange(role as OrganisationRole)
            }
            value={props.defaultRole}
          >
            <SelectTrigger className="mt-2 max-w-sm">
              <SelectValue>
                {props.defaultRole.replaceAll('_', ' ')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={OrganisationRole.Learner}>Learner</SelectItem>
              <SelectItem value={OrganisationRole.Tutor}>Tutor</SelectItem>
              <SelectItem value={OrganisationRole.OrganisationAdmin}>
                Organisation admin
              </SelectItem>
            </SelectContent>
          </Select>
        </label>
        <div className="flex justify-end">
          <Button disabled={props.pending} onClick={props.onSave}>
            Save defaults
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border p-5">
        <h2 className="font-semibold">Groups and cohorts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Incoming SCIM groups will be held as integration records. You will be
          able to map each one directly to either a Hektor cohort or a Hektor
          group without creating duplicate groups.
        </p>
      </section>
    </div>
  );
}
