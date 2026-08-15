import {
  LuBuilding2,
  LuCalendarDays,
  LuKeyRound,
  LuMail,
  LuShieldCheck,
  LuUserRound,
} from 'react-icons/lu';

export interface ProfileIdentityViewModel {
  id: string;
  provider: string;
  email?: string;
  createdAt?: string;
  lastSignInAt?: string;
}

export interface ProfileOrganisationViewModel {
  id: string;
  organisation: {
    id: string;
    name: string;
  };
  role: string;
  status: string;
  provisioningStatus: string;
  institutionalUserName: string;
}

export interface ProfilePageProps {
  avatarUrl?: string;
  createdAt: string;
  displayName: string;
  email?: string;
  identities: ProfileIdentityViewModel[];
  memberships: ProfileOrganisationViewModel[];
  platformRole?: string;
}

function initials(displayName: string) {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function providerName(provider: string) {
  const providers: Record<string, string> = {
    apple: 'Apple',
    azure: 'Microsoft',
    email: 'Email',
    google: 'Google',
    sso: 'Institutional SSO',
  };

  return providers[provider] ?? provider;
}

function readable(value: string) {
  return value.replaceAll('_', ' ');
}

export function ProfilePage({
  avatarUrl,
  createdAt,
  displayName,
  email,
  identities,
  memberships,
  platformRole,
}: ProfilePageProps) {
  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-semibold text-primary">
          {avatarUrl ? (
            <img alt="" className="size-full object-cover" src={avatarUrl} />
          ) : (
            initials(displayName) || (
              <LuUserRound aria-hidden="true" className="size-8" />
            )
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">Your profile</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            {displayName}
          </h1>
          {platformRole === 'admin' ? (
            <span className="mt-3 inline-flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <LuShieldCheck aria-hidden="true" className="size-3.5" />
              Platform admin
            </span>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {email ? (
              <span className="flex items-center gap-2">
                <LuMail aria-hidden="true" className="size-4" />
                {email}
              </span>
            ) : null}
            <span className="flex items-center gap-2">
              <LuCalendarDays aria-hidden="true" className="size-4" />
              Joined {formatDate(createdAt)}
            </span>
          </div>
        </div>
      </header>

      <section aria-labelledby="sign-in-methods-heading">
        <div className="mb-5">
          <h2
            className="text-xl font-bold tracking-tight"
            id="sign-in-methods-heading"
          >
            Sign-in methods
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            These identities all open the same Hektor account.
          </p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {identities.map((identity) => (
            <article
              className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              key={identity.id}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <LuKeyRound aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">
                    {providerName(identity.provider)}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {identity.email ?? 'No email supplied by provider'}
                  </p>
                </div>
              </div>
              <p className="pl-14 text-xs text-muted-foreground sm:pl-0 sm:text-right">
                {identity.lastSignInAt
                  ? `Last used ${formatDate(identity.lastSignInAt)}`
                  : identity.createdAt
                    ? `Added ${formatDate(identity.createdAt)}`
                    : 'Not used yet'}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="organisations-heading">
        <div className="mb-5">
          <h2
            className="text-xl font-bold tracking-tight"
            id="organisations-heading"
          >
            Organisations
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Membership controls institutional access without changing your
            personal account.
          </p>
        </div>
        {memberships.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {memberships.map((membership) => (
              <article
                className="border border-border bg-surface p-5"
                key={membership.id}
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center bg-accent text-accent-foreground">
                    <LuBuilding2 aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">
                      {membership.organisation.name}
                    </h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {membership.institutionalUserName}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs capitalize">
                      <span className="bg-primary/10 px-2.5 py-1 font-medium text-primary">
                        {readable(membership.role)}
                      </span>
                      <span className="bg-accent px-2.5 py-1 text-accent-foreground">
                        {readable(membership.status)}
                      </span>
                      {membership.provisioningStatus !== 'not_managed' ? (
                        <span className="flex items-center gap-1.5 bg-accent px-2.5 py-1 text-accent-foreground">
                          <LuShieldCheck
                            aria-hidden="true"
                            className="size-3.5"
                          />
                          SCIM {readable(membership.provisioningStatus)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border px-6 py-10 text-center">
            <LuBuilding2
              aria-hidden="true"
              className="mx-auto size-7 text-muted-foreground"
            />
            <h3 className="mt-3 font-semibold">Personal account</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              You are not currently a member of an organisation. University
              memberships will appear here when they are provisioned.
            </p>
          </div>
        )}
      </section>

      <aside className="border-l-2 border-primary bg-primary/5 px-5 py-4">
        <h2 className="font-semibold">Keep access when circumstances change</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Before leaving an organisation, add and verify a personal sign-in
          method. Account linking and editing will be available here later.
        </p>
      </aside>
    </div>
  );
}
