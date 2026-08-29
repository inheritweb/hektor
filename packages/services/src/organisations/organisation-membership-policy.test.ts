import { describe, expect, it } from 'vitest';

import { OrganisationRole, OrganisationUserStatus } from '@hektor/types';

import { assertOrganisationAdminMembershipUpdate } from './organisation-membership-policy';

const current = {
  role: OrganisationRole.OrganisationAdmin,
  status: OrganisationUserStatus.Active,
  user: { id: 'target-user' },
};

describe('organisation administrator membership policy', () => {
  it('prevents an administrator from demoting themself', () => {
    expect(() =>
      assertOrganisationAdminMembershipUpdate({
        activeOrganisationAdminCount: 2,
        actorUserId: 'target-user',
        current,
        next: {
          role: OrganisationRole.Tutor,
          status: OrganisationUserStatus.Active,
        },
      }),
    ).toThrow('You cannot demote or suspend your own administrator membership');
  });

  it('protects the final active administrator', () => {
    expect(() =>
      assertOrganisationAdminMembershipUpdate({
        activeOrganisationAdminCount: 1,
        actorUserId: 'another-admin',
        current,
        next: {
          role: OrganisationRole.OrganisationAdmin,
          status: OrganisationUserStatus.Suspended,
        },
      }),
    ).toThrow('The final active organisation administrator cannot be changed');
  });

  it('allows another administrator to change one of several administrators', () => {
    expect(() =>
      assertOrganisationAdminMembershipUpdate({
        activeOrganisationAdminCount: 2,
        actorUserId: 'another-admin',
        current,
        next: {
          role: OrganisationRole.Tutor,
          status: OrganisationUserStatus.Active,
        },
      }),
    ).not.toThrow();
  });
});
