import { notFound } from 'next/navigation';

import {
  createScimSimulatorService,
  createSimulatorService,
  simulatorScimUser,
  simulatorSessionScenarios,
} from '@hektor/services/simulator';
import { Button } from '@hektor/ui/atoms';
import { Logo } from '@hektor/ui/molecules';

import { env } from '@/env';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SimulatorPage({
  searchParams,
}: {
  searchParams: Promise<{ detail?: string; error?: string; notice?: string }>;
}) {
  if (process.env.NODE_ENV === 'production') notFound();

  const { detail, error, notice } = await searchParams;
  const service = createSimulatorService({
    adminClient: createAdminSupabaseClient(),
    sessionClient: await createServerSupabaseClient(),
  });
  const scenarios = await service.listScenarios();
  let scimUser;
  let scimStatusError: string | undefined;
  try {
    scimUser = await createScimSimulatorService({
      webBaseUrl: env.PUBLIC_BASE_URL,
    }).getUser();
  } catch (statusError) {
    scimStatusError =
      statusError instanceof Error ? statusError.message : 'SCIM unavailable';
  }

  return (
    <main className="min-h-screen bg-muted/35 px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <Logo size="lg" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Identity and provisioning scenarios
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            This separate development application initiates identity scenarios.
            Their outcomes are rendered by the real Hektor web application.
          </p>
        </header>

        {error ? (
          <p
            className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            The scenario could not be completed ({error})
            {detail ? `: ${detail}` : '.'}
          </p>
        ) : null}

        {notice ? (
          <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-foreground">
            {notice === 'scim-user-provisioned'
              ? 'The simulated identity provider provisioned or reactivated its learner through SCIM.'
              : 'The simulated identity provider deactivated its learner through SCIM.'}
          </p>
        ) : null}

        <section className="divide-y divide-border/60 rounded-xl bg-card px-6 shadow-[0_0_24px_-12px_rgb(0_0_0/0.18)]">
          {scenarios.map(
            ({ account, membership, provision, scenario }, index) => (
              <article className="py-6" key={scenario.id}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Scenario {index + 1}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      {scenario.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {scenario.email}
                    </p>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-x-4">
                      <dt className="font-medium">Seeded state</dt>
                      <dd className="text-muted-foreground">
                        {scenario.startingState}
                      </dd>
                      <dt className="font-medium">Current state</dt>
                      <dd className="text-muted-foreground">
                        Hektor account: {account ? 'yes' : 'no'} · Membership:{' '}
                        {membership ?? 'none'} · Provision:{' '}
                        {provision?.status ?? 'none'}
                      </dd>
                      <dt className="font-medium">Expected result</dt>
                      <dd className="text-muted-foreground">
                        {scenario.expected}
                      </dd>
                    </dl>
                  </div>

                  <form
                    action="/api/session"
                    method="post"
                    rel="noopener"
                    target="_blank"
                  >
                    <input
                      name="scenarioId"
                      type="hidden"
                      value={scenario.id}
                    />
                    <Button type="submit">{scenario.action}</Button>
                  </form>
                </div>
              </article>
            ),
          )}
        </section>

        <header>
          <h2 className="text-2xl font-semibold tracking-tight">
            SCIM identity provider
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Pushes a directory user through Hektor’s real bearer-authenticated
            SCIM API. It does not write Hektor provisioning tables directly.
          </p>
        </header>

        <section className="rounded-xl bg-card p-6 shadow-[0_0_24px_-12px_rgb(0_0_0/0.18)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="font-semibold">{simulatorScimUser.displayName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {simulatorScimUser.email}
              </p>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
                <dt className="font-medium">Target tenant</dt>
                <dd className="text-muted-foreground">
                  Northbridge University
                </dd>
                <dt className="font-medium">SCIM state</dt>
                <dd className="text-muted-foreground">
                  {scimStatusError
                    ? `Unavailable: ${scimStatusError}`
                    : scimUser
                      ? scimUser.active
                        ? 'Active'
                        : 'Inactive'
                      : 'Not yet provisioned'}
                </dd>
                <dt className="font-medium">Expected result</dt>
                <dd className="text-muted-foreground">
                  Provision/reactivate creates an active learner provision.
                  Deactivate revokes the current provision without deleting its
                  history.
                </dd>
              </dl>
            </div>
            <div className="flex gap-2">
              <form action="/api/scim" method="post">
                <input name="action" type="hidden" value="deactivate" />
                <Button
                  disabled={!scimUser?.active}
                  type="submit"
                  variant="outline"
                >
                  Deactivate through SCIM
                </Button>
              </form>
              <form action="/api/scim" method="post">
                <input name="action" type="hidden" value="provision" />
                <Button type="submit">
                  {scimUser?.active
                    ? 'Synchronize through SCIM'
                    : 'Provision through SCIM'}
                </Button>
              </form>
            </div>
          </div>
        </section>

        <header>
          <h2 className="text-2xl font-semibold tracking-tight">
            Tenant workspace sessions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            These pods establish a real local session without changing identity
            or provisioning records.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {simulatorSessionScenarios.map((scenario) => (
            <article
              className="rounded-xl bg-card p-6 shadow-[0_0_24px_-12px_rgb(0_0_0/0.18)]"
              key={scenario.id}
            >
              <h3 className="font-semibold">{scenario.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {scenario.email}
              </p>
              <p className="mt-4 text-sm">{scenario.startingState}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Expected: {scenario.expected}
              </p>
              <form
                action="/api/session"
                className="mt-5"
                method="post"
                rel="noopener"
                target="_blank"
              >
                <input name="scenarioId" type="hidden" value={scenario.id} />
                <Button type="submit">Start session</Button>
              </form>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
