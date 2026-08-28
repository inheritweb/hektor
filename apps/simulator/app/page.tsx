import { notFound } from 'next/navigation';

import {
  createSimulatorService,
  simulatorSessionScenarios,
} from '@hektor/services/simulator';
import { Button } from '@hektor/ui/atoms';
import { Logo } from '@hektor/ui/molecules';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SimulatorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (process.env.NODE_ENV === 'production') notFound();

  const { error } = await searchParams;
  const service = createSimulatorService({
    adminClient: createAdminSupabaseClient(),
    sessionClient: await createServerSupabaseClient(),
  });
  const scenarios = await service.listScenarios();

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
            The scenario could not be completed ({error}).
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
