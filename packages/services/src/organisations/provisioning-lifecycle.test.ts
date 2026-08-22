import { describe, expect, it } from 'vitest';

import {
  ProvisioningLifecycleAction as Action,
  ProvisioningStatus as Status,
} from '@hektor/types';

import {
  canTransitionProvisioningStatus,
  getProvisioningTransition,
} from './provisioning-lifecycle';

describe('provisioning lifecycle', () => {
  it.each([
    [Status.Pending, Action.Link, Status.Linked],
    [Status.Pending, Action.Fail, Status.Failed],
    [Status.Failed, Action.Retry, Status.Pending],
    [Status.Linked, Action.Deactivate, Status.Inactive],
    [Status.Inactive, Action.Reactivate, Status.Linked],
    [Status.Pending, Action.Revoke, Status.Revoked],
    [Status.Linked, Action.Revoke, Status.Revoked],
    [Status.Inactive, Action.Revoke, Status.Revoked],
    [Status.Failed, Action.Revoke, Status.Revoked],
  ])('allows %s -> %s -> %s', (from, action, to) => {
    expect(canTransitionProvisioningStatus(from, action)).toBe(true);
    expect(getProvisioningTransition(from, action)).toBe(to);
  });

  it.each([
    [Status.Linked, Action.Fail],
    [Status.Linked, Action.Link],
    [Status.Inactive, Action.Fail],
    [Status.Revoked, Action.Link],
    [Status.Revoked, Action.Retry],
    [Status.Revoked, Action.Reactivate],
  ])('rejects %s -> %s', (from, action) => {
    expect(canTransitionProvisioningStatus(from, action)).toBe(false);
    expect(getProvisioningTransition(from, action)).toBeUndefined();
  });
});
