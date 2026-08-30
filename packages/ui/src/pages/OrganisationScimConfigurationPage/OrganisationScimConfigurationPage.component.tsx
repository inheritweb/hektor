import {
  OrganisationRole,
  ScimGroupTargetType,
  type OrganisationScimConfiguration,
  type OrganisationScimGroupMapping,
  type OrganisationCohortSummary,
  type OrganisationGroupSummary,
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
  mappings?: readonly OrganisationScimGroupMapping[];
  cohorts?: readonly OrganisationCohortSummary[];
  groups?: readonly OrganisationGroupSummary[];
  onMappingChange?: (
    mappingId: string,
    target:
      | { targetId: string; targetType: ScimGroupTargetType.Cohort }
      | { targetId: string; targetType: ScimGroupTargetType.Group }
      | { targetId: null; targetType: null },
  ) => void;
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
          Map each incoming directory group directly to a Hektor cohort or
          group. Unmapped groups remain integration records and do not appear in
          the normal group directory.
        </p>
        <div className="mt-4 divide-y divide-border/60">
          {props.mappings?.length ? (
            props.mappings.map((mapping) => {
              const value = mapping.target
                ? `${mapping.target.type}:${mapping.target.id}`
                : 'unmapped';
              return (
                <div
                  className="grid gap-3 py-4 sm:grid-cols-[1fr_16rem] sm:items-center"
                  key={mapping.id}
                >
                  <div>
                    <p className="font-medium">{mapping.displayName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {mapping.memberCount}{' '}
                      {mapping.memberCount === 1 ? 'member' : 'members'}
                      {mapping.sourceDeletedAt ? ' · Removed at source' : ''}
                    </p>
                  </div>
                  <Select
                    disabled={props.pending || Boolean(mapping.sourceDeletedAt)}
                    onValueChange={(nextValue) => {
                      if (!nextValue || !props.onMappingChange) return;
                      if (nextValue === 'unmapped') {
                        props.onMappingChange(mapping.id, {
                          targetId: null,
                          targetType: null,
                        });
                        return;
                      }
                      const [type, targetId] = nextValue.split(':');
                      if (!targetId) return;
                      if (type === ScimGroupTargetType.Cohort)
                        props.onMappingChange(mapping.id, {
                          targetId,
                          targetType: ScimGroupTargetType.Cohort,
                        });
                      else if (type === ScimGroupTargetType.Group)
                        props.onMappingChange(mapping.id, {
                          targetId,
                          targetType: ScimGroupTargetType.Group,
                        });
                    }}
                    value={value}
                  >
                    <SelectTrigger
                      aria-label={`Mapping for ${mapping.displayName}`}
                    >
                      <SelectValue>
                        {mapping.target
                          ? `${mapping.target.type === ScimGroupTargetType.Cohort ? 'Cohort' : 'Group'}: ${mapping.target.name}`
                          : 'Unmapped'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unmapped">Unmapped</SelectItem>
                      {(props.cohorts ?? []).map((cohort) => (
                        <SelectItem
                          key={cohort.id}
                          value={`${ScimGroupTargetType.Cohort}:${cohort.id}`}
                        >
                          Cohort: {cohort.name}
                        </SelectItem>
                      ))}
                      {(props.groups ?? []).map((group) => (
                        <SelectItem
                          key={group.id}
                          value={`${ScimGroupTargetType.Group}:${group.id}`}
                        >
                          Group: {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })
          ) : (
            <p className="py-4 text-sm text-muted-foreground">
              No groups have been received from the identity provider.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
