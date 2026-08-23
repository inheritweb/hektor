'use client';

import { useRouter } from 'next/navigation';

import {
  useAcceptOrganisationUserProvision,
  useGetProvisionAcceptance,
} from '@hektor/query/organisations';
import { ProvisionAcceptancePage } from '@hektor/ui/pages';
import { UnauthenticatedTemplate } from '@hektor/ui/templates';

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
      <UnauthenticatedTemplate width="lg">
        <div className="h-72 w-full max-w-xl animate-pulse bg-accent/40" />
      </UnauthenticatedTemplate>
    );
  }
  if (provision.isError) {
    return (
      <UnauthenticatedTemplate>
        <p className="text-sm font-semibold text-primary">
          Organisation invitation
        </p>
        <h1 className="mt-2 text-3xl font-bold">Invitation unavailable</h1>
        <p className="mt-4 text-muted-foreground">{provision.error.message}</p>
      </UnauthenticatedTemplate>
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
