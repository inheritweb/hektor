import type { UserStatus, UserSummary } from './users';

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

export interface TenantOrganisationContext {
  accessMode: 'membership' | 'platform';
  organisation: OrganisationSummary;
  role?: OrganisationRole;
}

export enum OrganisationUserStatus {
  Active = 'active',
  Suspended = 'suspended',
}

export enum OrganisationSeatStatus {
  Allocated = 'allocated',
  NotAllocated = 'not_allocated',
}

export enum ProvisioningMethod {
  Scim = 'scim',
  Csv = 'csv',
  Manual = 'manual',
}

export interface OrganisationScimConfiguration {
  defaultRole: OrganisationRole;
  enabled: boolean;
  endpointPath: string;
  tokenCreatedAt?: string;
  tokenRevokedAt?: string;
  tokenSuffix?: string;
  updatedAt?: string;
}

export interface OrganisationScimTokenResult extends OrganisationScimConfiguration {
  token: string;
}

export enum ScimGroupTargetType {
  Cohort = 'cohort',
  Group = 'group',
}

export interface OrganisationScimGroupMapping {
  displayName: string;
  externalId: string;
  id: string;
  lastSynchronizedAt: string;
  sourceDeletedAt?: string;
  target?:
    | { id: string; name: string; type: ScimGroupTargetType.Cohort }
    | { id: string; name: string; type: ScimGroupTargetType.Group };
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

export interface UpdateOrganisationGroupMembershipInput {
  addProvisionIds: string[];
  addUserIds: string[];
  removeProvisionIds: string[];
  removeUserIds: string[];
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

export interface CreateOrganisationGroupInput {
  cohortId?: string;
  name: string;
}

export interface UpdateOrganisationGroupInput extends CreateOrganisationGroupInput {
  expectedUpdatedAt: string;
  status: GroupStatus;
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
  platformStatus: UserStatus;
  organisation: OrganisationSummary;
  cohort?: OrganisationCohortSummary;
  groups: OrganisationGroupSummary[];
  provisioning?: {
    id: string;
    method: ProvisioningMethod;
    status: ProvisioningStatus;
  };
  seatActivation?: {
    activatedAt: string;
    contractPeriodId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganisationMembershipInput {
  cohortId?: string;
  expectedUpdatedAt: string;
  role: OrganisationRole;
  status: OrganisationUserStatus;
}

export interface OrganisationMembershipCandidate extends UserSummary {
  pendingProvision?: {
    id: string;
    role: OrganisationRole;
  };
}

export interface CreateOrganisationMembershipsInput {
  cohortId?: string;
  role: OrganisationRole;
  userIds: string[];
}

export interface CreateOrganisationMembershipsResult {
  membershipIds: string[];
  reconciledProvisionIds: string[];
}

export interface CreateOrganisationUserInput {
  cohortId?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: OrganisationRole;
}

export interface CreateOrganisationUserResult {
  membershipId: string;
  userId: string;
}

export enum OrganisationProvisionImportAction {
  CreateProvision = 'create_provision',
  LinkExistingUser = 'link_existing_user',
  AlreadyProvisioned = 'already_provisioned',
  AlreadyConnected = 'already_connected',
  Invalid = 'invalid',
}

export interface OrganisationProvisionImportRow {
  cohortName?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: OrganisationRole;
  rowNumber: number;
}

export interface OrganisationProvisionImportRowReview extends OrganisationProvisionImportRow {
  action: OrganisationProvisionImportAction;
  message?: string;
}

export interface OrganisationProvisionImportPreview {
  rows: OrganisationProvisionImportRowReview[];
  summary: {
    errors: number;
    ready: number;
    unchanged: number;
  };
}

export interface OrganisationProvisionImportResult {
  created: number;
  invitationsFailed: number;
  invitationsSent: number;
  linked: number;
  unchanged: number;
}

export enum TenantOrganisationProvisionImportAction {
  Ready = 'ready',
  Unchanged = 'unchanged',
  Invalid = 'invalid',
}

export interface TenantOrganisationProvisionImportRowReview extends OrganisationProvisionImportRow {
  action: TenantOrganisationProvisionImportAction;
  message?: string;
}

export interface TenantOrganisationProvisionImportPreview {
  rows: TenantOrganisationProvisionImportRowReview[];
  summary: {
    errors: number;
    ready: number;
    unchanged: number;
  };
}

export interface TenantOrganisationProvisionImportResult {
  processed: number;
  unchanged: number;
}

export enum OrganisationBulkInvitationOutcome {
  Failed = 'failed',
  Sent = 'sent',
  Skipped = 'skipped',
}

export interface OrganisationBulkInvitationItemResult {
  email?: string;
  message?: string;
  outcome: OrganisationBulkInvitationOutcome;
  provisionId: string;
}

export interface OrganisationBulkInvitationResult {
  failed: number;
  items: OrganisationBulkInvitationItemResult[];
  sent: number;
  skipped: number;
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
  seatStatus: OrganisationSeatStatus;
  platformStatus: UserStatus;
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
