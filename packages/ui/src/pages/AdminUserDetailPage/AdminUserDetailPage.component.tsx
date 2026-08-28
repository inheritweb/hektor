import {
  LuArrowLeft,
  LuBuilding2,
  LuCalendarDays,
  LuKeyRound,
  LuMail,
  LuShieldCheck,
  LuUserRound,
} from 'react-icons/lu';

import { buttonVariants } from '../../atoms/Button';
import { Button } from '../../atoms/Button';
import { createTableColumn, Table } from '../../atoms/Table';
import { NavigationLink } from '../../context';

export interface AdminUserIdentityViewModel {
  createdAt?: string;
  email?: string;
  id: string;
  lastSignInAt?: string;
  provider: string;
}

export interface AdminUserMembershipViewModel {
  id: string;
  organisation: {
    id: string;
    name: string;
    status: string;
  };
  role: string;
  status: string;
}

export interface AdminUserDetailViewModel {
  avatarUrl?: string;
  createdAt: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  id: string;
  identities: readonly AdminUserIdentityViewModel[];
  memberships: readonly AdminUserMembershipViewModel[];
  platformRole?: string;
  status: string;
  updatedAt: string;
}

export interface AdminUserDetailPageProps {
  backHref: string;
  user: AdminUserDetailViewModel;
  onEdit?: () => void;
}

function initials(displayName: string) {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatDate(value?: string) {
  if (!value) return 'Never';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function readable(value: string) {
  return value.replaceAll('_', ' ');
}

const membershipColumn = createTableColumn<AdminUserMembershipViewModel>();

const membershipColumns = [
  membershipColumn.accessor('organisation', {
    header: 'Organisation',
    cell: ({ value }) => (
      <div className="min-w-44">
        <p className="font-semibold text-foreground">{value.name}</p>
        <p className="text-xs capitalize text-muted-foreground">
          {readable(value.status)}
        </p>
      </div>
    ),
  }),
  membershipColumn.accessor('role', {
    header: 'Role',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
  membershipColumn.accessor('status', {
    header: 'Membership',
    cell: ({ value }) => <span className="capitalize">{readable(value)}</span>,
  }),
];

export function AdminUserDetailPage({
  backHref,
  user,
  onEdit,
}: AdminUserDetailPageProps) {
  return (
    <div className="space-y-12">
      <NavigationLink
        className={buttonVariants({ size: 'sm', variant: 'ghost' })}
        href={backHref}
      >
        <LuArrowLeft aria-hidden="true" />
        Users
      </NavigationLink>

      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-semibold text-primary">
          {user.avatarUrl ? (
            <img
              alt=""
              className="size-full object-cover"
              src={user.avatarUrl}
            />
          ) : (
            initials(user.displayName) || (
              <LuUserRound aria-hidden="true" className="size-8" />
            )
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary">User account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            {user.displayName}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              Personal account
            </span>
            {user.platformRole === 'admin' ? (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <LuShieldCheck aria-hidden="true" />
                Platform admin
              </span>
            ) : null}
            <span
              className={
                user.status === 'suspended'
                  ? 'inline-flex bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive'
                  : 'inline-flex bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground'
              }
            >
              {user.status === 'suspended' ? 'Suspended' : 'Active'}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {user.email ? (
              <span className="flex items-center gap-2">
                <LuMail aria-hidden="true" />
                {user.email}
              </span>
            ) : null}
            <span className="flex items-center gap-2">
              <LuCalendarDays aria-hidden="true" />
              Joined {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
        {onEdit ? (
          <Button onClick={onEdit} variant="outline">
            Edit user
          </Button>
        ) : null}
      </header>

      <section aria-labelledby="identities-heading">
        <div className="mb-5">
          <h2
            className="text-xl font-bold tracking-tight"
            id="identities-heading"
          >
            Sign-in identities
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Authentication providers connected to this account.
          </p>
        </div>
        {user.identities.length > 0 ? (
          <div className="divide-y divide-border border-y border-border">
            {user.identities.map((identity) => (
              <article
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
                key={identity.id}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <LuKeyRound aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold capitalize">
                      {readable(identity.provider)}
                    </h3>
                    <p className="truncate text-sm text-muted-foreground">
                      {identity.email ?? 'No provider email'}
                    </p>
                  </div>
                </div>
                <p className="pl-14 text-xs text-muted-foreground sm:pl-0 sm:text-right">
                  Last used {formatDate(identity.lastSignInAt)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
            No sign-in identities are recorded.
          </div>
        )}
      </section>

      <section aria-labelledby="memberships-heading">
        <div className="mb-5 flex items-start gap-3">
          <LuBuilding2
            aria-hidden="true"
            className="mt-0.5 size-5 text-primary"
          />
          <div>
            <h2
              className="text-xl font-bold tracking-tight"
              id="memberships-heading"
            >
              Organisation memberships
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Institutional access layered onto this personal account.
            </p>
          </div>
        </div>
        {user.memberships.length > 0 ? (
          <Table
            caption={`Organisation memberships for ${user.displayName}`}
            columns={membershipColumns}
            getRowId={(membership) => membership.id}
            highlight
            rows={user.memberships}
          />
        ) : (
          <div className="border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
            This user does not belong to an organisation.
          </div>
        )}
      </section>
    </div>
  );
}
