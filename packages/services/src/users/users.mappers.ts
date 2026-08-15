import {
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
  ScimResourceStatus,
  type CurrentUser,
  type UserIdentity,
  type UserOrganisation,
} from '@hektor/types';
import type {
  User,
  UserIdentity as SupabaseUserIdentity,
} from '@supabase/supabase-js';

import type { CurrentUserOrganisationsQueryResult } from './users.queries';

function optionalString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function mapUserIdentity(identity: SupabaseUserIdentity): UserIdentity {
  return {
    id: identity.id,
    provider: identity.provider,
    email: optionalString(identity.identity_data?.email),
    createdAt: identity.created_at ?? undefined,
    lastSignInAt: identity.last_sign_in_at ?? undefined,
  };
}

export function mapUserOrganisation(
  membership: CurrentUserOrganisationsQueryResult[number],
): UserOrganisation {
  return {
    membershipId: membership.id,
    id: membership.organisation.id,
    name: membership.organisation.name,
    slug: membership.organisation.slug,
    status: membership.organisation.status as OrganisationStatus,
    role: membership.role as OrganisationRole,
    membershipStatus: membership.status as OrganisationUserStatus,
    scimStatus: membership.scim_status as ScimResourceStatus,
    institutionalUserName: membership.user_name,
  };
}

export function mapCurrentUser(
  user: User,
  memberships: CurrentUserOrganisationsQueryResult,
): CurrentUser {
  const displayName =
    optionalString(user.user_metadata.full_name) ??
    optionalString(user.user_metadata.name) ??
    user.email ??
    'Hektor user';

  return {
    id: user.id,
    displayName,
    isPlatformAdmin: user.app_metadata.role === 'admin',
    email: user.email,
    avatarUrl:
      optionalString(user.user_metadata.avatar_url) ??
      optionalString(user.user_metadata.picture),
    identities: (user.identities ?? []).map(mapUserIdentity),
    organisations: memberships.map(mapUserOrganisation),
    createdAt: user.created_at,
    updatedAt: user.updated_at ?? user.created_at,
  };
}
