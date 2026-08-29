import { LuLayers3, LuMail, LuTicketCheck } from 'react-icons/lu';

import { buttonVariants } from '../../atoms/Button';
import { NavigationLink } from '../../context';

export interface AdminOrganisationMembershipDetailViewModel {
  cohort?: { id: string; name: string };
  groups: readonly { id: string; name: string; status: string }[];
  id: string;
  provisioning?: { id: string; method: string; status: string };
  role: string;
  platformStatus: string;
  seatActivation?: { activatedAt: string; contractPeriodId: string };
  status: string;
  user: { displayName: string; email?: string; id: string };
}

export interface AdminOrganisationMembershipDetailPageProps {
  editHref: string;
  getGroupHref?: (groupId: string) => string;
  membership: AdminOrganisationMembershipDetailViewModel;
  provisionHref?: string;
}

function readable(value: string) {
  return value.replaceAll('_', ' ');
}

export function AdminOrganisationMembershipDetailPage({
  editHref,
  getGroupHref,
  membership,
  provisionHref,
}: AdminOrganisationMembershipDetailPageProps) {
  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">
            Organisation user
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {membership.user.displayName}
          </h1>
          {membership.user.email ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <LuMail aria-hidden="true" />
              {membership.user.email}
            </p>
          ) : null}
        </div>
        <NavigationLink
          className={buttonVariants({ variant: 'outline' })}
          href={editHref}
        >
          Edit membership
        </NavigationLink>
      </header>

      <section
        className="grid gap-6 sm:grid-cols-2"
        aria-label="Membership details"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Role
          </p>
          <p className="mt-1 capitalize">{readable(membership.role)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <p className="mt-1 capitalize">{readable(membership.status)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Platform status
          </p>
          <p className="mt-1 capitalize">
            {readable(membership.platformStatus)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cohort
          </p>
          <p className="mt-1">{membership.cohort?.name ?? 'None'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Organisation seat
          </p>
          <p className="mt-1">
            {membership.seatActivation ? 'Allocated' : 'Not allocated'}
          </p>
        </div>
      </section>

      <section aria-labelledby="membership-groups-heading">
        <div className="flex items-center gap-2">
          <LuLayers3 aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-bold" id="membership-groups-heading">
            Groups
          </h2>
        </div>
        {membership.groups.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {membership.groups.map((group) =>
              getGroupHref ? (
                <NavigationLink
                  className="rounded bg-accent px-3 py-1.5 text-sm hover:bg-accent/70"
                  href={getGroupHref(group.id)}
                  key={group.id}
                >
                  {group.name}
                </NavigationLink>
              ) : (
                <span
                  className="rounded bg-accent px-3 py-1.5 text-sm"
                  key={group.id}
                >
                  {group.name}
                </span>
              ),
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Not assigned to any groups.
          </p>
        )}
      </section>

      <section aria-labelledby="membership-provision-heading">
        <div className="flex items-center gap-2">
          <LuTicketCheck aria-hidden="true" className="text-primary" />
          <h2 className="text-xl font-bold" id="membership-provision-heading">
            Provisioning
          </h2>
        </div>
        {membership.provisioning ? (
          <div className="mt-3 text-sm">
            <p className="capitalize">
              {readable(membership.provisioning.method)} ·{' '}
              {readable(membership.provisioning.status)}
            </p>
            {provisionHref ? (
              <NavigationLink
                className="mt-2 inline-block font-semibold text-primary hover:underline"
                href={provisionHref}
              >
                View provision
              </NavigationLink>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            This membership is managed manually.
          </p>
        )}
      </section>
    </div>
  );
}
