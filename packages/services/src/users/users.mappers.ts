import {
  IdentityProvider,
  type OrganisationMembershipSummary,
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
  PlatformRole,
  type CurrentUser,
  type UserIdentity,
  type UserListItem,
} from '@hektor/types';
import type {
  User,
  UserIdentity as SupabaseUserIdentity,
} from '@supabase/supabase-js';

import type { CurrentUserOrganisationsQueryResult } from './users.queries';

function optionalString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function mapIdentityProvider(provider: string) {
  if (provider === IdentityProvider.Email) return IdentityProvider.Email;
  if (provider === IdentityProvider.Google) return IdentityProvider.Google;

  throw new Error(`Unsupported identity provider: ${provider}`);
}

export function mapUserIdentity(identity: SupabaseUserIdentity): UserIdentity {
  return {
    id: identity.id,
    provider: mapIdentityProvider(identity.provider),
    email: optionalString(identity.identity_data?.email),
    createdAt: identity.created_at ?? undefined,
    lastSignInAt: identity.last_sign_in_at ?? undefined,
  };
}

export function mapOrganisationMembershipSummary(
  membership: CurrentUserOrganisationsQueryResult[number],
): OrganisationMembershipSummary {
  return {
    id: membership.id,
    organisation: {
      id: membership.organisation.id,
      name: membership.organisation.name,
      slug: membership.organisation.slug,
      status: membership.organisation.status as OrganisationStatus,
    },
    role: membership.role as OrganisationRole,
    status: membership.status as OrganisationUserStatus,
  };
}

export function mapUserSummary(user: User) {
  const mapped = mapCurrentUser(user, []);

  return {
    id: mapped.id,
    displayName: mapped.displayName,
    platformRole: mapped.platformRole,
    email: mapped.email,
    avatarUrl: mapped.avatarUrl,
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
    platformRole:
      user.app_metadata.role === PlatformRole.Admin
        ? PlatformRole.Admin
        : undefined,
    email: user.email,
    avatarUrl:
      optionalString(user.user_metadata.avatar_url) ??
      optionalString(user.user_metadata.picture),
    identities: (user.identities ?? []).map(mapUserIdentity),
    memberships: memberships.map(mapOrganisationMembershipSummary),
    createdAt: user.created_at,
    updatedAt: user.updated_at ?? user.created_at,
  };
}

export function mapUserListItem(
  user: User,
  membershipCount: number,
): UserListItem {
  const mapped = mapCurrentUser(user, []);

  return {
    id: mapped.id,
    displayName: mapped.displayName,
    platformRole: mapped.platformRole,
    email: mapped.email,
    avatarUrl: mapped.avatarUrl,
    createdAt: mapped.createdAt,
    identityProviders: mapped.identities.map((identity) => identity.provider),
    lastSignInAt: user.last_sign_in_at,
    membershipCount,
  };
}
