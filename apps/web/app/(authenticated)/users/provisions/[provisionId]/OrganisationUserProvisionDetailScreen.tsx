'use client';

import {
  useGetOrganisationUserProvision,
  useSendOrganisationProvisionInvitation,
  useTransitionOrganisationUserProvision,
} from '@hektor/query/organisations';
import { ProvisioningLifecycleAction, ProvisioningStatus } from '@hektor/types';
import { AdminOrganisationUserProvisionDetailPage } from '@hektor/ui/pages';

export function OrganisationUserProvisionDetailScreen({
  provisionId,
}: {
  provisionId: string;
}) {
  const provision = useGetOrganisationUserProvision({
    params: { provisionId },
  });
  const transition = useTransitionOrganisationUserProvision();
  const invitation = useSendOrganisationProvisionInvitation();
  if (provision.isPending)
    return (
      <div
        aria-label="Loading provision"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  if (provision.isError)
    return (
      <p className="text-destructive" role="alert">
        {provision.error.message}
      </p>
    );

  const run = (action: ProvisioningLifecycleAction) =>
    transition.mutate({
      params: { provisionId },
      body: { action, expectedStatus: provision.data.data.status },
    });
  const pending = transition.isPending || invitation.isPending;
  const status = provision.data.data.status;
  const actions =
    status === ProvisioningStatus.Pending
      ? [
          {
            label: provision.data.data.invitationSendCount
              ? 'Resend invitation'
              : 'Send invitation',
            disabled: pending,
            onSelect: () =>
              invitation.mutate({ params: { provisionId }, body: {} }),
          },
          {
            label: 'Revoke',
            disabled: pending,
            onSelect: () => run(ProvisioningLifecycleAction.Revoke),
            variant: 'destructive' as const,
          },
        ]
      : status === ProvisioningStatus.Linked
        ? [
            {
              label: 'Deactivate',
              disabled: pending,
              onSelect: () => run(ProvisioningLifecycleAction.Deactivate),
              variant: 'outline' as const,
            },
            {
              label: 'Revoke',
              disabled: pending,
              onSelect: () => run(ProvisioningLifecycleAction.Revoke),
              variant: 'destructive' as const,
            },
          ]
        : status === ProvisioningStatus.Inactive
          ? [
              {
                label: 'Reactivate',
                disabled: pending,
                onSelect: () => run(ProvisioningLifecycleAction.Reactivate),
              },
              {
                label: 'Revoke',
                disabled: pending,
                onSelect: () => run(ProvisioningLifecycleAction.Revoke),
                variant: 'destructive' as const,
              },
            ]
          : [];

  return (
    <AdminOrganisationUserProvisionDetailPage
      actions={actions}
      actionError={transition.error?.message ?? invitation.error?.message}
      actionMessage={invitation.isSuccess ? 'Invitation sent.' : undefined}
      getGroupHref={({ id }) => `/groups/${id}`}
      provision={provision.data.data}
      showAccountLinking={false}
    />
  );
}
