import { ProvisioningLifecycleAction, ProvisioningStatus } from '@hektor/types';

const transitions: Record<
  ProvisioningStatus,
  Partial<Record<ProvisioningLifecycleAction, ProvisioningStatus>>
> = {
  [ProvisioningStatus.Pending]: {
    [ProvisioningLifecycleAction.Link]: ProvisioningStatus.Linked,
    [ProvisioningLifecycleAction.Revoke]: ProvisioningStatus.Revoked,
    [ProvisioningLifecycleAction.Fail]: ProvisioningStatus.Failed,
  },
  [ProvisioningStatus.Linked]: {
    [ProvisioningLifecycleAction.Deactivate]: ProvisioningStatus.Inactive,
    [ProvisioningLifecycleAction.Revoke]: ProvisioningStatus.Revoked,
  },
  [ProvisioningStatus.Inactive]: {
    [ProvisioningLifecycleAction.Reactivate]: ProvisioningStatus.Linked,
    [ProvisioningLifecycleAction.Revoke]: ProvisioningStatus.Revoked,
  },
  [ProvisioningStatus.Failed]: {
    [ProvisioningLifecycleAction.Retry]: ProvisioningStatus.Pending,
    [ProvisioningLifecycleAction.Revoke]: ProvisioningStatus.Revoked,
  },
  [ProvisioningStatus.Revoked]: {},
};

export function getProvisioningTransition(
  status: ProvisioningStatus,
  action: ProvisioningLifecycleAction,
) {
  return transitions[status][action];
}

export function canTransitionProvisioningStatus(
  status: ProvisioningStatus,
  action: ProvisioningLifecycleAction,
) {
  return getProvisioningTransition(status, action) !== undefined;
}
