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

export enum ScimResourceStatus {
  NotManaged = 'not_managed',
  Active = 'active',
  Inactive = 'inactive',
  Deleted = 'deleted',
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

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  status: OrganisationStatus;
  contractPeriods: OrganisationContractPeriod[];
  cohorts: CohortSummary[];
  groups: OrganisationGroupSummary[];
  usersSummary: OrganisationUsersSummary;
  createdAt: string;
  updatedAt: string;
}

export interface OrganisationUsersSummary {
  total: number;
  linked: number;
  awaitingAccountLinking: number;
  learners: number;
  tutors: number;
  organisationAdmins: number;
  suspended: number;
}

export interface Cohort {
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

export interface OrganisationGroup {
  id: string;
  name: string;
  status: GroupStatus;
  organisation: OrganisationSummary;
  cohort?: CohortSummary;
  users: OrganisationMembershipUserSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganisationMembership {
  id: string;
  userId?: string;
  userName: string;
  displayName?: string;
  role: OrganisationRole;
  status: OrganisationUserStatus;
  scimStatus: ScimResourceStatus;
  linked: boolean;
  organisation: OrganisationSummary;
  cohort?: CohortSummary;
  groups: OrganisationGroupSummary[];
  externalId?: string;
  givenName?: string;
  familyName?: string;
  linkedAt?: string;
  lastScimSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganisationMembershipSummary {
  id: string;
  organisation: OrganisationSummary;
  role: OrganisationRole;
  status: OrganisationUserStatus;
  provisioningStatus: ScimResourceStatus;
  institutionalUserName: string;
}

export type OrganisationSummary = Pick<
  Organisation,
  'id' | 'name' | 'slug' | 'status'
>;

export type CohortSummary = Pick<
  Cohort,
  'id' | 'name' | 'startsOn' | 'endsOn' | 'status'
>;

export type OrganisationGroupSummary = Pick<
  OrganisationGroup,
  'id' | 'name' | 'status'
>;

export type OrganisationMembershipUserSummary = Pick<
  OrganisationMembership,
  | 'id'
  | 'userId'
  | 'userName'
  | 'displayName'
  | 'role'
  | 'status'
  | 'scimStatus'
  | 'linked'
>;
