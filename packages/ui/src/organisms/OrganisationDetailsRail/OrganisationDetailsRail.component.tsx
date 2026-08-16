export interface OrganisationDetailsRailViewModel {
  createdAt: string;
  name: string;
  slug: string;
  status: string;
  updatedAt: string;
}

export interface OrganisationDetailsRailProps {
  headingLevel?: 1 | 2;
  organisation: OrganisationDetailsRailViewModel;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function readable(value: string) {
  return value.replaceAll('_', ' ');
}

export function OrganisationDetailsRail({
  headingLevel = 1,
  organisation,
}: OrganisationDetailsRailProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <aside className="space-y-8 lg:sticky lg:top-8">
      <header>
        <p className="text-sm font-semibold text-primary">Organisation</p>
        <Heading className="mt-1 text-3xl font-bold tracking-tight">
          {organisation.name}
        </Heading>
        <span className="mt-4 inline-flex bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
          {readable(organisation.status)}
        </span>
      </header>

      <dl className="divide-y divide-border border-y border-border text-sm">
        <div className="py-4">
          <dt className="text-muted-foreground">Slug</dt>
          <dd className="mt-1 break-all font-mono text-xs">
            {organisation.slug}
          </dd>
        </div>
        <div className="py-4">
          <dt className="text-muted-foreground">Created</dt>
          <dd className="mt-1 font-medium">
            {formatDate(organisation.createdAt)}
          </dd>
        </div>
        <div className="py-4">
          <dt className="text-muted-foreground">Last updated</dt>
          <dd className="mt-1 font-medium">
            {formatDate(organisation.updatedAt)}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
