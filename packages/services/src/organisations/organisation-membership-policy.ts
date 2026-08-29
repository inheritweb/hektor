import { OrganisationRole, OrganisationUserStatus } from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';

import { createServiceError } from '../errors';

export function assertOrganisationAdminMembershipUpdate(input: {
  activeOrganisationAdminCount: number;
  actorUserId: string;
  current: {
    role: OrganisationRole;
    status: OrganisationUserStatus;
    user: { id: string };
  };
  next: { role: OrganisationRole; status: OrganisationUserStatus };
}) {
  const removesActiveAdmin =
    input.current.role === OrganisationRole.OrganisationAdmin &&
    input.current.status === OrganisationUserStatus.Active &&
    (input.next.role !== OrganisationRole.OrganisationAdmin ||
      input.next.status !== OrganisationUserStatus.Active);

  if (!removesActiveAdmin) return;

  if (input.current.user.id === input.actorUserId) {
    throw createServiceError(HektorErrorCode.Conflict, {
      message: 'You cannot demote or suspend your own administrator membership',
    });
  }

  if (input.activeOrganisationAdminCount <= 1) {
    throw createServiceError(HektorErrorCode.Conflict, {
      message: 'The final active organisation administrator cannot be changed',
    });
  }
}
