import { z } from 'zod';

import {
  type Organisation,
  type OrganisationContractPeriod,
  type OrganisationGroupSummary,
  type OrganisationMembershipUserSummary,
  type OrganisationSummary,
  type OrganisationUsersSummary,
  type CohortSummary,
  GroupStatus,
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
  ScimResourceStatus,
} from '../organisations';
import { PlatformRole } from '../users';
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

export const cohortSummarySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  startsOn: z.iso.date(),
  endsOn: z.iso.date(),
  status: z.enum(GroupStatus),
}) satisfies z.ZodType<CohortSummary>;

export const organisationGroupSummarySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  status: z.enum(GroupStatus),
}) satisfies z.ZodType<OrganisationGroupSummary>;

export const organisationUsersSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  linked: z.number().int().nonnegative(),
  awaitingAccountLinking: z.number().int().nonnegative(),
  learners: z.number().int().nonnegative(),
  tutors: z.number().int().nonnegative(),
  organisationAdmins: z.number().int().nonnegative(),
  suspended: z.number().int().nonnegative(),
}) satisfies z.ZodType<OrganisationUsersSummary>;

export const organisationMembershipUserSummarySchema = z.object({
  id: z.uuid(),
  userId: z.uuid().optional(),
  userName: z.string().min(1),
  displayName: z.string().min(1).optional(),
  role: z.enum(OrganisationRole),
  status: z.enum(OrganisationUserStatus),
  scimStatus: z.enum(ScimResourceStatus),
  linked: z.boolean(),
}) satisfies z.ZodType<OrganisationMembershipUserSummary>;

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
  cohorts: z.array(cohortSummarySchema),
  groups: z.array(organisationGroupSummarySchema),
  usersSummary: organisationUsersSummarySchema,
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

export const listOrganisationUsersContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/users',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  query: paginationQuerySchema.extend({
    order: z.enum(['userName', 'role']).default('userName'),
  }),
  output: hektorCollectionResponseSchema(
    z.array(organisationMembershipUserSummarySchema),
  ),
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

export type ListOrganisationUsersParams = ContractParams<
  typeof listOrganisationUsersContract
>;

export type ListOrganisationUsersQuery = ContractQuery<
  typeof listOrganisationUsersContract
>;

export type ListOrganisationUsersResponse = ContractOutput<
  typeof listOrganisationUsersContract
>;
