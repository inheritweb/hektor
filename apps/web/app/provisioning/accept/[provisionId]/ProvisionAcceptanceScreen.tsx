'use client';

import { useRouter } from 'next/navigation';

import {
  useAcceptOrganisationUserProvision,
  useGetProvisionAcceptance,
} from '@hektor/query/organisations';
import { Logo } from '@hektor/ui/molecules';
import { ProvisionAcceptancePage } from '@hektor/ui/pages';

export function ProvisionAcceptanceScreen({
  provisionId,
}: {
  provisionId: string;
}) {
  const router = useRouter();
  const provision = useGetProvisionAcceptance({ params: { provisionId } });
  const acceptance = useAcceptOrganisationUserProvision({
    onSuccess: () => router.push('/'),
  });

  if (provision.isPending) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
        <Logo className="mb-8" size="lg" />
        <div className="h-72 w-full max-w-xl animate-pulse bg-accent/40" />
      </main>
    );
  }
  if (provision.isError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-foreground">
        <Logo className="mb-8" size="lg" />
        <section className="w-full max-w-md bg-card p-10 shadow-[0_0_24px_-12px_rgb(0_0_0/0.18)]">
          <h1 className="text-3xl font-bold">Invitation unavailable</h1>
          <p className="mt-4 text-muted-foreground">
            {provision.error.message}
          </p>
        </section>
      </main>
    );
  }

  const invitation = provision.data.data;
  return (
    <ProvisionAcceptancePage
      error={acceptance.error?.message}
      isAccepting={acceptance.isPending}
      onAccept={() => acceptance.mutate({ params: { provisionId }, body: {} })}
      onDecline={() => router.push('/')}
      organisationName={invitation.organisation.name}
      provisionedDisplayName={invitation.provisionedDisplayName}
      provisionedRole={invitation.provisionedRole}
      provisionedUserName={invitation.provisionedUserName}
    />
  );
}
