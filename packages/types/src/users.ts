import type {
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
  ScimResourceStatus,
} from './organisations';

export interface UserIdentity {
  id: string;
  provider: string;
  email?: string;
  createdAt?: string;
  lastSignInAt?: string;
}

export interface UserOrganisation {
  membershipId: string;
  id: string;
  name: string;
  slug: string;
  status: OrganisationStatus;
  role: OrganisationRole;
  membershipStatus: OrganisationUserStatus;
  scimStatus: ScimResourceStatus;
  institutionalUserName: string;
}

export interface CurrentUser {
  id: string;
  displayName: string;
  isPlatformAdmin: boolean;
  email?: string;
  avatarUrl?: string;
  identities: UserIdentity[];
  organisations: UserOrganisation[];
  createdAt: string;
  updatedAt: string;
}
