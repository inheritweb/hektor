import { NavigationLink } from '../../context';
import { Button } from '../../atoms';

interface Summary {
  id: string;
  name: string;
}

interface LinkedUser {
  id: string;
  displayName: string;
  email?: string;
}

export interface AdminOrganisationUserProvisionDetailViewModel {
  cohort?: Summary;
  createdAt: string;
  groups: readonly Summary[];
  invitationConsumedAt?: string;
  invitationExpiresAt?: string;
  invitationSendCount: number;
  invitationSentAt?: string;
  lastSynchronizedAt?: string;
  linkedAt?: string;
  linkedUser?: LinkedUser;
  organisationUserId?: string;
  provisionedDisplayName?: string;
  provisionedFamilyName?: string;
  provisionedGivenName?: string;
  provisionedRole: string;
  provisionedUserName: string;
  provisioningMethod: string;
  revokedAt?: string;
  sourceExternalId?: string;
  status: string;
  updatedAt: string;
}

export interface AdminOrganisationUserProvisionDetailPageProps {
  actions?: readonly {
    disabled?: boolean;
    label: string;
    onSelect: () => void;
    variant?: 'default' | 'outline' | 'destructive';
  }[];
  actionError?: string;
  actionMessage?: string;
  getGroupHref?: (group: Summary) => string;
  getUserHref?: (user: LinkedUser) => string;
  showAccountLinking?: boolean;
  provision: AdminOrganisationUserProvisionDetailViewModel;
}

function readable(value: string) {
  return value.replaceAll('_', ' ');
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function Value({ children }: { children?: React.ReactNode }) {
  return <dd className="mt-1 break-words font-medium">{children ?? '—'}</dd>;
}

export function AdminOrganisationUserProvisionDetailPage({
  actions = [],
  actionError,
  actionMessage,
  getGroupHref,
  getUserHref,
  provision,
  showAccountLinking = true,
}: AdminOrganisationUserProvisionDetailPageProps) {
  const displayName =
    provision.provisionedDisplayName ?? provision.provisionedUserName;

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-semibold text-primary">Provisioned user</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
          <span className="bg-primary/10 px-2 py-1 text-xs font-semibold capitalize text-primary">
            {readable(provision.status)}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {provision.provisionedUserName} ·{' '}
          {provision.provisioningMethod.toUpperCase()}
        </p>
        {actions.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                disabled={action.disabled}
                key={action.label}
                onClick={action.onSelect}
                variant={action.variant}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
        {actionError ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {actionError}
          </p>
        ) : null}
        {actionMessage ? (
          <p className="mt-3 text-sm text-muted-foreground" role="status">
            {actionMessage}
          </p>
        ) : null}
      </header>

      <section>
        <h2 className="text-xl font-bold">Provisioned identity</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Display name</dt>
            <Value>{provision.provisionedDisplayName}</Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Username</dt>
            <Value>{provision.provisionedUserName}</Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Given name</dt>
            <Value>{provision.provisionedGivenName}</Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Family name</dt>
            <Value>{provision.provisionedFamilyName}</Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <Value>
              <span className="capitalize">
                {readable(provision.provisionedRole)}
              </span>
            </Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Source identifier</dt>
            <Value>{provision.sourceExternalId}</Value>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-xl font-bold">Organisation assignment</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Cohort</dt>
            <Value>{provision.cohort?.name}</Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Groups</dt>
            <Value>
              {provision.groups.length ? (
                <span className="flex flex-wrap gap-x-3 gap-y-1">
                  {provision.groups.map((group) =>
                    getGroupHref ? (
                      <NavigationLink
                        className="text-primary hover:underline"
                        href={getGroupHref(group)}
                        key={group.id}
                      >
                        {group.name}
                      </NavigationLink>
                    ) : (
                      <span key={group.id}>{group.name}</span>
                    ),
                  )}
                </span>
              ) : undefined}
            </Value>
          </div>
        </dl>
      </section>

      {showAccountLinking ? (
        <section>
          <h2 className="text-xl font-bold">Account linking</h2>
          {provision.linkedUser ? (
            <div className="mt-4 bg-accent/35 p-4 text-sm">
              <p className="font-semibold">
                {provision.linkedUser.displayName}
              </p>
              {provision.linkedUser.email ? (
                <p className="mt-1 text-muted-foreground">
                  {provision.linkedUser.email}
                </p>
              ) : null}
              {getUserHref ? (
                <NavigationLink
                  className="mt-3 inline-flex font-semibold text-primary hover:underline"
                  href={getUserHref(provision.linkedUser)}
                >
                  View canonical user
                </NavigationLink>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              This provision has not been linked to a Hektor user.
            </p>
          )}
        </section>
      ) : null}

      <section>
        <h2 className="text-xl font-bold">Invitation</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Last sent</dt>
            <Value>
              {provision.invitationSentAt
                ? formatDateTime(provision.invitationSentAt)
                : undefined}
            </Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Expires</dt>
            <Value>
              {provision.invitationExpiresAt
                ? formatDateTime(provision.invitationExpiresAt)
                : undefined}
            </Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Used</dt>
            <Value>
              {provision.invitationConsumedAt
                ? formatDateTime(provision.invitationConsumedAt)
                : undefined}
            </Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Times sent</dt>
            <Value>{provision.invitationSendCount.toString()}</Value>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-xl font-bold">Lifecycle timestamps</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <Value>{formatDateTime(provision.createdAt)}</Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Last updated</dt>
            <Value>{formatDateTime(provision.updatedAt)}</Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Last synchronized</dt>
            <Value>
              {provision.lastSynchronizedAt
                ? formatDateTime(provision.lastSynchronizedAt)
                : undefined}
            </Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Linked</dt>
            <Value>
              {provision.linkedAt
                ? formatDateTime(provision.linkedAt)
                : undefined}
            </Value>
          </div>
          <div>
            <dt className="text-muted-foreground">Revoked</dt>
            <Value>
              {provision.revokedAt
                ? formatDateTime(provision.revokedAt)
                : undefined}
            </Value>
          </div>
        </dl>
      </section>
    </div>
  );
}
