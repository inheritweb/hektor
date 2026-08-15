import { z } from 'zod';

import {
  type Organisation,
  type OrganisationContractPeriod,
  type OrganisationSummary,
  type CohortSummary,
  GroupStatus,
  OrganisationStatus,
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
