'use client';

import {
  useAdminAutoLinkOrganisationUserProvision,
  useAdminGetOrganisationUserProvision,
  useAdminTransitionOrganisationUserProvision,
} from '@hektor/query/organisations';
import { AdminOrganisationUserProvisionDetailPage } from '@hektor/ui/pages';
import {
  ProvisioningAutoLinkOutcome,
  ProvisioningLifecycleAction,
  ProvisioningStatus,
} from '@hektor/types';

export function AdminOrganisationUserProvisionDetailScreen({
  organisationId,
  provisionId,
}: {
  organisationId: string;
  provisionId: string;
}) {
  const provision = useAdminGetOrganisationUserProvision({
    params: { organisationId, provisionId },
  });
  const transition = useAdminTransitionOrganisationUserProvision();
  const autoLink = useAdminAutoLinkOrganisationUserProvision();

  if (provision.isPending)
    return (
      <div
        aria-label="Loading provisioned user"
        className="h-72 animate-pulse bg-accent/50"
      />
    );
  if (provision.isError)
    return (
      <section>
        <h1 className="text-2xl font-bold">
          We couldn&apos;t load this provisioned user.
        </h1>
        <p className="mt-2 text-muted-foreground">{provision.error.message}</p>
      </section>
    );

  const runTransition = (action: ProvisioningLifecycleAction) =>
    transition.mutate({
      params: { organisationId, provisionId },
      body: { action, expectedStatus: provision.data.data.status },
    });
  const pending = transition.isPending || autoLink.isPending;
  const actionMessage =
    autoLink.data?.data.outcome ===
    ProvisioningAutoLinkOutcome.PendingIdentityVerification
      ? 'No verified Hektor account currently matches this provision.'
      : autoLink.data?.data.outcome ===
          ProvisioningAutoLinkOutcome.PendingMembershipAcceptance
        ? 'The account exists, but the user must accept this organisation membership.'
        : undefined;
  const actions =
    provision.data.data.status === ProvisioningStatus.Pending
      ? [
          {
            label: 'Match existing account',
            disabled: pending,
            onSelect: () =>
              autoLink.mutate({
                params: { organisationId, provisionId },
                body: {},
              }),
          },
          {
            label: 'Mark failed',
            disabled: pending,
            onSelect: () => runTransition(ProvisioningLifecycleAction.Fail),
            variant: 'outline' as const,
          },
          {
            label: 'Revoke',
            disabled: pending,
            onSelect: () => runTransition(ProvisioningLifecycleAction.Revoke),
            variant: 'destructive' as const,
          },
        ]
      : provision.data.data.status === ProvisioningStatus.Linked
        ? [
            {
              label: 'Deactivate',
              disabled: pending,
              onSelect: () =>
                runTransition(ProvisioningLifecycleAction.Deactivate),
              variant: 'outline' as const,
            },
            {
              label: 'Revoke',
              disabled: pending,
              onSelect: () => runTransition(ProvisioningLifecycleAction.Revoke),
              variant: 'destructive' as const,
            },
          ]
        : provision.data.data.status === ProvisioningStatus.Inactive
          ? [
              {
                label: 'Reactivate',
                disabled: pending,
                onSelect: () =>
                  runTransition(ProvisioningLifecycleAction.Reactivate),
              },
              {
                label: 'Revoke',
                disabled: pending,
                onSelect: () =>
                  runTransition(ProvisioningLifecycleAction.Revoke),
                variant: 'destructive' as const,
              },
            ]
          : provision.data.data.status === ProvisioningStatus.Failed
            ? [
                {
                  label: 'Retry',
                  disabled: pending,
                  onSelect: () =>
                    runTransition(ProvisioningLifecycleAction.Retry),
                },
                {
                  label: 'Revoke',
                  disabled: pending,
                  onSelect: () =>
                    runTransition(ProvisioningLifecycleAction.Revoke),
                  variant: 'destructive' as const,
                },
              ]
            : [];

  return (
    <AdminOrganisationUserProvisionDetailPage
      actions={actions}
      actionError={transition.error?.message ?? autoLink.error?.message}
      actionMessage={actionMessage}
      getGroupHref={(group) =>
        `/admin/organisations/${organisationId}/groups/${group.id}`
      }
      getUserHref={(user) => `/admin/users/${user.id}`}
      provision={provision.data.data}
    />
  );
}
