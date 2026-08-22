import { z } from 'zod';

import {
  type Organisation,
  type OrganisationCohortSummary,
  type OrganisationCohort,
  type OrganisationContractPeriod,
  type OrganisationGroupSummary,
  type OrganisationGroup,
  type OrganisationGroupProvisionedUserSummary,
  type OrganisationMembershipUserSummary,
  type OrganisationSummary,
  type OrganisationUserProvision,
  type OrganisationUserProvisionDetail,
  type OrganisationUserProvisionsSummary,
  type OrganisationUsersSummary,
  GroupStatus,
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
  ProvisioningMethod,
  ProvisioningStatus,
} from '../organisations';
import { PlatformRole } from '../users';
import { userSummarySchema } from './users';
import {
  type ContractOutput,
  type ContractParams,
  type ContractQuery,
  defineContract,
  hektorCollectionResponseSchema,
  hektorResponseSchema,
  paginationQuerySchema,
} from './base';

export const organisationSummarySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(OrganisationStatus),
}) satisfies z.ZodType<OrganisationSummary>;

export const organisationCohortSummarySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  startsOn: z.iso.date(),
  endsOn: z.iso.date(),
  status: z.enum(GroupStatus),
}) satisfies z.ZodType<OrganisationCohortSummary>;

export const organisationGroupSummarySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  status: z.enum(GroupStatus),
  provisioningMethod: z.enum(ProvisioningMethod).optional(),
  sourceExternalId: z.string().min(1).optional(),
}) satisfies z.ZodType<OrganisationGroupSummary>;

export const organisationGroupProvisionedUserSummarySchema = z.object({
  id: z.uuid(),
  provisioningMethod: z.enum(ProvisioningMethod),
  provisionedDisplayName: z.string().min(1).optional(),
  provisionedRole: z.enum(OrganisationRole),
  provisionedUserName: z.string().min(1),
  status: z.enum(ProvisioningStatus),
}) satisfies z.ZodType<OrganisationGroupProvisionedUserSummary>;

export const organisationUsersSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  learners: z.number().int().nonnegative(),
  tutors: z.number().int().nonnegative(),
  organisationAdmins: z.number().int().nonnegative(),
  suspended: z.number().int().nonnegative(),
}) satisfies z.ZodType<OrganisationUsersSummary>;

export const organisationUserProvisionsSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  inactive: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
}) satisfies z.ZodType<OrganisationUserProvisionsSummary>;

export const organisationMembershipUserSummarySchema = z.object({
  id: z.uuid(),
  user: userSummarySchema,
  role: z.enum(OrganisationRole),
  status: z.enum(OrganisationUserStatus),
}) satisfies z.ZodType<OrganisationMembershipUserSummary>;

export const organisationCohortSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  startsOn: z.iso.date(),
  endsOn: z.iso.date(),
  status: z.enum(GroupStatus),
  organisation: organisationSummarySchema,
  groups: z.array(organisationGroupSummarySchema),
  learners: z.array(organisationMembershipUserSummarySchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<OrganisationCohort>;

export const organisationGroupSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  status: z.enum(GroupStatus),
  organisation: organisationSummarySchema,
  cohort: organisationCohortSummarySchema.optional(),
  users: z.array(organisationMembershipUserSummarySchema),
  provisionedUsers: z.array(organisationGroupProvisionedUserSummarySchema),
  provisioningMethod: z.enum(ProvisioningMethod).optional(),
  sourceExternalId: z.string().min(1).optional(),
  lastSynchronizedAt: z.iso.datetime().optional(),
  sourceDeletedAt: z.iso.datetime().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<OrganisationGroup>;

export const organisationUserProvisionSchema = z.object({
  id: z.uuid(),
  organisation: organisationSummarySchema,
  cohort: organisationCohortSummarySchema.optional(),
  groups: z.array(organisationGroupSummarySchema),
  organisationUserId: z.uuid().optional(),
  provisioningMethod: z.enum(ProvisioningMethod),
  sourceExternalId: z.string().min(1).optional(),
  provisionedUserName: z.string().min(1),
  provisionedDisplayName: z.string().min(1).optional(),
  provisionedGivenName: z.string().min(1).optional(),
  provisionedFamilyName: z.string().min(1).optional(),
  provisionedRole: z.enum(OrganisationRole),
  status: z.enum(ProvisioningStatus),
  lastSynchronizedAt: z.iso.datetime().optional(),
  linkedAt: z.iso.datetime().optional(),
  revokedAt: z.iso.datetime().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<OrganisationUserProvision>;

export const organisationUserProvisionDetailSchema =
  organisationUserProvisionSchema.extend({
    linkedUser: userSummarySchema.optional(),
  }) satisfies z.ZodType<OrganisationUserProvisionDetail>;

export const contractPeriodSchema = z.object({
  id: z.uuid(),
  startsOn: z.iso.date(),
  endsOn: z.iso.date(),
  seats: z.object({
    allowed: z.number().int().nonnegative(),
    activated: z.number().int().nonnegative(),
    remaining: z.number().int().nonnegative(),
  }),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<OrganisationContractPeriod>;

export const organisationSchema = organisationSummarySchema.extend({
  contractPeriods: z.array(contractPeriodSchema),
  cohorts: z.array(organisationCohortSummarySchema),
  groups: z.array(organisationGroupSummarySchema),
  usersSummary: organisationUsersSummarySchema,
  userProvisionsSummary: organisationUserProvisionsSummarySchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<Organisation>;

export const listOrganisationsContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  query: paginationQuerySchema.extend({
    order: z.enum(['name', 'createdAt']).default('name'),
  }),
  output: hektorCollectionResponseSchema(z.array(organisationSummarySchema)),
});

export const getOrganisationContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  output: hektorResponseSchema(organisationSchema),
});

export const listOrganisationContractPeriodsContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/contract-periods',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  query: paginationQuerySchema.extend({
    order: z.enum(['startsOn', 'endsOn']).default('startsOn'),
  }),
  output: hektorCollectionResponseSchema(z.array(contractPeriodSchema)),
});

export const listOrganisationCohortsContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/cohorts',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  query: paginationQuerySchema.extend({
    order: z.enum(['name', 'startsOn', 'endsOn']).default('startsOn'),
    status: z.enum(GroupStatus).optional(),
  }),
  output: hektorCollectionResponseSchema(
    z.array(organisationCohortSummarySchema),
  ),
});

export const getOrganisationCohortContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/cohorts/:cohortId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), cohortId: z.uuid() }),
  output: hektorResponseSchema(organisationCohortSchema),
});

export const listOrganisationGroupsContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/groups',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  query: paginationQuerySchema.extend({
    order: z.enum(['name', 'createdAt']).default('name'),
    status: z.enum(GroupStatus).optional(),
    provisioningMethod: z.enum(ProvisioningMethod).optional(),
  }),
  output: hektorCollectionResponseSchema(
    z.array(organisationGroupSummarySchema),
  ),
});

export const getOrganisationGroupContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/groups/:groupId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), groupId: z.uuid() }),
  output: hektorResponseSchema(organisationGroupSchema),
});

export const listOrganisationUsersContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/users',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  query: paginationQuerySchema.extend({
    order: z.enum(['displayName', 'role']).default('displayName'),
    role: z.enum(OrganisationRole).optional(),
    status: z.enum(OrganisationUserStatus).optional(),
    query: z.string().trim().min(1).optional(),
  }),
  output: hektorCollectionResponseSchema(
    z.array(organisationMembershipUserSummarySchema),
  ),
});

export const listOrganisationUserProvisionsContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/user-provisions',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  query: paginationQuerySchema.extend({
    order: z.enum(['displayName', 'role']).default('displayName'),
    role: z.enum(OrganisationRole).optional(),
    status: z.enum(ProvisioningStatus).optional(),
    query: z.string().trim().min(1).optional(),
  }),
  output: hektorCollectionResponseSchema(
    z.array(organisationUserProvisionSchema),
  ),
});

export const getOrganisationUserProvisionContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/user-provisions/:provisionId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), provisionId: z.uuid() }),
  output: hektorResponseSchema(organisationUserProvisionDetailSchema),
});

export type ListOrganisationsQuery = ContractQuery<
  typeof listOrganisationsContract
>;

export type ListOrganisationsResponse = ContractOutput<
  typeof listOrganisationsContract
>;

export type GetOrganisationParams = ContractParams<
  typeof getOrganisationContract
>;

export type GetOrganisationResponse = ContractOutput<
  typeof getOrganisationContract
>;

export type ListOrganisationContractPeriodsParams = ContractParams<
  typeof listOrganisationContractPeriodsContract
>;

export type ListOrganisationContractPeriodsQuery = ContractQuery<
  typeof listOrganisationContractPeriodsContract
>;

export type ListOrganisationContractPeriodsResponse = ContractOutput<
  typeof listOrganisationContractPeriodsContract
>;

export type ListOrganisationCohortsParams = ContractParams<
  typeof listOrganisationCohortsContract
>;

export type ListOrganisationCohortsQuery = ContractQuery<
  typeof listOrganisationCohortsContract
>;

export type ListOrganisationCohortsResponse = ContractOutput<
  typeof listOrganisationCohortsContract
>;

export type GetOrganisationCohortParams = ContractParams<
  typeof getOrganisationCohortContract
>;

export type GetOrganisationCohortResponse = ContractOutput<
  typeof getOrganisationCohortContract
>;

export type ListOrganisationGroupsParams = ContractParams<
  typeof listOrganisationGroupsContract
>;

export type ListOrganisationGroupsQuery = ContractQuery<
  typeof listOrganisationGroupsContract
>;

export type ListOrganisationGroupsResponse = ContractOutput<
  typeof listOrganisationGroupsContract
>;

export type GetOrganisationGroupParams = ContractParams<
  typeof getOrganisationGroupContract
>;

export type GetOrganisationGroupResponse = ContractOutput<
  typeof getOrganisationGroupContract
>;

export type ListOrganisationUsersParams = ContractParams<
  typeof listOrganisationUsersContract
>;

export type ListOrganisationUsersQuery = ContractQuery<
  typeof listOrganisationUsersContract
>;

export type ListOrganisationUsersResponse = ContractOutput<
  typeof listOrganisationUsersContract
>;

export type ListOrganisationUserProvisionsParams = ContractParams<
  typeof listOrganisationUserProvisionsContract
>;

export type ListOrganisationUserProvisionsQuery = ContractQuery<
  typeof listOrganisationUserProvisionsContract
>;

export type ListOrganisationUserProvisionsResponse = ContractOutput<
  typeof listOrganisationUserProvisionsContract
>;

export type GetOrganisationUserProvisionParams = ContractParams<
  typeof getOrganisationUserProvisionContract
>;

export type GetOrganisationUserProvisionResponse = ContractOutput<
  typeof getOrganisationUserProvisionContract
>;
