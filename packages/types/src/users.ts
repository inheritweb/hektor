import type { OrganisationMembershipSummary } from './organisations';

export enum IdentityProvider {
  Email = 'email',
  Google = 'google',
}

export enum PlatformRole {
  Admin = 'admin',
}

export enum UserStatus {
  Active = 'active',
  Suspended = 'suspended',
}

export interface UserName {
  email?: string;
  firstName?: string;
  lastName?: string;
}

export function getUserDisplayName(user: UserName) {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.email ||
    'Hektor user'
  );
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
  firstName?: string;
  lastName?: string;
  status: UserStatus;
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
  status: UserStatus;
  createdAt: string;
  identityProviders: IdentityProvider[];
  lastSignInAt?: string;
  membershipCount: number;
}

export type CurrentUser = User;

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  platformRole?: PlatformRole;
}

export interface UpdateUserInput {
  expectedUpdatedAt: string;
  firstName: string;
  lastName: string;
  platformRole?: PlatformRole;
  status: UserStatus;
}
