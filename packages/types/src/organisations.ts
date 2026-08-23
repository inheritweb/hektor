import type { UserSummary } from './users';

export enum OrganisationStatus {
  Active = 'active',
  Suspended = 'suspended',
  Archived = 'archived',
}

export enum OrganisationRole {
  OrganisationAdmin = 'org_admin',
  Tutor = 'tutor',
  Learner = 'learner',
}

export enum OrganisationUserStatus {
  Active = 'active',
  Suspended = 'suspended',
}

export enum ProvisioningMethod {
  Scim = 'scim',
  Csv = 'csv',
  Manual = 'manual',
}

export enum ProvisioningStatus {
  Pending = 'pending',
  Linked = 'linked',
  Inactive = 'inactive',
  Revoked = 'revoked',
  Failed = 'failed',
}

export enum ProvisioningLifecycleAction {
  Link = 'link',
  Deactivate = 'deactivate',
  Reactivate = 'reactivate',
  Revoke = 'revoke',
  Fail = 'fail',
  Retry = 'retry',
}

export enum ProvisioningAutoLinkOutcome {
  Linked = 'linked',
  PendingIdentityVerification = 'pending_identity_verification',
  PendingMembershipAcceptance = 'pending_membership_acceptance',
}

export interface ProvisioningLifecycleResult {
  id: string;
  status: ProvisioningStatus;
}

export interface ProvisioningAutoLinkResult {
  outcome: ProvisioningAutoLinkOutcome;
  organisationUserId?: string;
}

export interface OrganisationProvisionInvitationResult {
  expiresAt: string;
  sendCount: number;
  sentAt: string;
}

export enum GroupStatus {
  Active = 'active',
  Archived = 'archived',
}

export interface SeatUsage {
  allowed: number;
  activated: number;
  remaining: number;
}

export interface OrganisationContractPeriod {
  id: string;
  startsOn: string;
  endsOn: string;
  seats: SeatUsage;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganisationContractPeriodInput {
  endsOn: string;
  learnerSeatAllowance: number;
  startsOn: string;
}

export interface UpdateOrganisationContractPeriodInput extends CreateOrganisationContractPeriodInput {
  expectedUpdatedAt: string;
}

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  status: OrganisationStatus;
  contractPeriods: OrganisationContractPeriod[];
  cohorts: OrganisationCohortSummary[];
  groups: OrganisationGroupSummary[];
  usersSummary: OrganisationUsersSummary;
  userProvisionsSummary: OrganisationUserProvisionsSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganisationInput {
  name: string;
  slug: string;
}

export interface UpdateOrganisationInput {
  expectedStatus: OrganisationStatus;
  name: string;
  slug: string;
  status: OrganisationStatus;
}

export interface OrganisationUsersSummary {
  total: number;
  learners: number;
  tutors: number;
  organisationAdmins: number;
  suspended: number;
}

export interface OrganisationUserProvisionsSummary {
  total: number;
  pending: number;
  inactive: number;
  failed: number;
}

export interface OrganisationCohort {
  id: string;
  name: string;
  startsOn: string;
  endsOn: string;
  status: GroupStatus;
  organisation: OrganisationSummary;
  groups: OrganisationGroupSummary[];
  learners: OrganisationMembershipUserSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganisationCohortInput {
  endsOn: string;
  name: string;
  startsOn: string;
}

export interface UpdateOrganisationCohortInput extends CreateOrganisationCohortInput {
  expectedUpdatedAt: string;
  status: GroupStatus;
}

export interface OrganisationGroup {
  id: string;
  name: string;
  status: GroupStatus;
  organisation: OrganisationSummary;
  cohort?: OrganisationCohortSummary;
  users: OrganisationMembershipUserSummary[];
  provisionedUsers: OrganisationGroupProvisionedUserSummary[];
  provisioningMethod?: ProvisioningMethod;
  sourceExternalId?: string;
  lastSynchronizedAt?: string;
  sourceDeletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganisationGroupProvisionedUserSummary {
  id: string;
  provisioningMethod: ProvisioningMethod;
  provisionedDisplayName?: string;
  provisionedRole: OrganisationRole;
  provisionedUserName: string;
  status: ProvisioningStatus;
}

export interface OrganisationMembership {
  id: string;
  user: UserSummary;
  role: OrganisationRole;
  status: OrganisationUserStatus;
  organisation: OrganisationSummary;
  cohort?: OrganisationCohortSummary;
  groups: OrganisationGroupSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganisationMembershipSummary {
  id: string;
  organisation: OrganisationSummary;
  role: OrganisationRole;
  status: OrganisationUserStatus;
}

export interface OrganisationMembershipUserSummary {
  id: string;
  user: UserSummary;
  role: OrganisationRole;
  status: OrganisationUserStatus;
}

export interface OrganisationUserProvision {
  id: string;
  organisation: OrganisationSummary;
  cohort?: OrganisationCohortSummary;
  groups: OrganisationGroupSummary[];
  organisationUserId?: string;
  provisioningMethod: ProvisioningMethod;
  sourceExternalId?: string;
  provisionedUserName: string;
  provisionedDisplayName?: string;
  provisionedGivenName?: string;
  provisionedFamilyName?: string;
  provisionedRole: OrganisationRole;
  status: ProvisioningStatus;
  lastSynchronizedAt?: string;
  linkedAt?: string;
  revokedAt?: string;
  invitationSentAt?: string;
  invitationExpiresAt?: string;
  invitationConsumedAt?: string;
  invitationSendCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganisationUserProvisionDetail extends OrganisationUserProvision {
  linkedUser?: UserSummary;
}

export type OrganisationSummary = Pick<
  Organisation,
  'id' | 'name' | 'slug' | 'status'
>;

export type OrganisationCohortSummary = Pick<
  OrganisationCohort,
  'id' | 'name' | 'startsOn' | 'endsOn' | 'status'
>;

export type OrganisationGroupSummary = Pick<
  OrganisationGroup,
  'id' | 'name' | 'status' | 'provisioningMethod' | 'sourceExternalId'
>;
