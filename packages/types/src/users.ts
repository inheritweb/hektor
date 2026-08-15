import type { OrganisationMembershipSummary } from './organisations';

export enum IdentityProvider {
  Email = 'email',
  Google = 'google',
}

export enum PlatformRole {
  Admin = 'admin',
}

export interface UserIdentity {
  id: string;
  provider: IdentityProvider;
  email?: string;
  createdAt?: string;
  lastSignInAt?: string;
}

export interface User {
  id: string;
  displayName: string;
  platformRole?: PlatformRole;
  email?: string;
  avatarUrl?: string;
  identities: UserIdentity[];
  memberships: OrganisationMembershipSummary[];
  createdAt: string;
  updatedAt: string;
}

export type UserSummary = Pick<
  User,
  'id' | 'displayName' | 'email' | 'avatarUrl' | 'platformRole'
>;

export interface UserListItem extends UserSummary {
  createdAt: string;
  identityProviders: IdentityProvider[];
  lastSignInAt?: string;
  membershipCount: number;
}

export type CurrentUser = User;
