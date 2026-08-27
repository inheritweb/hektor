import { z } from 'zod';

import {
  type Organisation,
  type CreateOrganisationInput,
  type OrganisationCohortSummary,
  type OrganisationCohort,
  type CreateOrganisationCohortInput,
  type OrganisationContractPeriod,
  type CreateOrganisationContractPeriodInput,
  type OrganisationGroupSummary,
  type OrganisationGroup,
  type CreateOrganisationGroupInput,
  type OrganisationGroupProvisionedUserSummary,
  type OrganisationMembershipUserSummary,
  type OrganisationMembership,
  type OrganisationMembershipCandidate,
  type OrganisationProvisionInvitationResult,
  type OrganisationSummary,
  type OrganisationUserProvision,
  type OrganisationUserProvisionDetail,
  type OrganisationUserProvisionsSummary,
  type OrganisationUsersSummary,
  type UpdateOrganisationInput,
  type UpdateOrganisationContractPeriodInput,
  type UpdateOrganisationCohortInput,
  type UpdateOrganisationGroupInput,
  type UpdateOrganisationGroupMembershipInput,
  type UpdateOrganisationMembershipInput,
  type CreateOrganisationMembershipsInput,
  type CreateOrganisationMembershipsResult,
  type CreateOrganisationUserInput,
  type CreateOrganisationUserResult,
  type OrganisationProvisionImportPreview,
  type OrganisationProvisionImportResult,
  type OrganisationProvisionImportRow,
  type OrganisationProvisionImportRowReview,
  OrganisationProvisionImportAction,
  type OrganisationBulkInvitationItemResult,
  type OrganisationBulkInvitationResult,
  OrganisationBulkInvitationOutcome,
  type ProvisioningAutoLinkResult,
  type ProvisioningLifecycleResult,
  GroupStatus,
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
  ProvisioningMethod,
  ProvisioningAutoLinkOutcome,
  ProvisioningLifecycleAction,
  ProvisioningStatus,
} from '../organisations';
import { PlatformRole } from '../users';
import { userSummarySchema } from './users';
import {
  type ContractOutput,
  type ContractBody,
  type ContractParams,
  type ContractQuery,
  defineContract,
  emptyObjectSchema,
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

export const organisationMembershipSchema = z.object({
  id: z.uuid(),
  user: userSummarySchema,
  role: z.enum(OrganisationRole),
  status: z.enum(OrganisationUserStatus),
  organisation: organisationSummarySchema,
  cohort: organisationCohortSummarySchema.optional(),
  groups: z.array(organisationGroupSummarySchema),
  provisioning: z
    .object({
      id: z.uuid(),
      method: z.enum(ProvisioningMethod),
      status: z.enum(ProvisioningStatus),
    })
    .optional(),
  seatActivation: z
    .object({
      activatedAt: z.iso.datetime(),
      contractPeriodId: z.uuid(),
    })
    .optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<OrganisationMembership>;

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
  invitationSentAt: z.iso.datetime().optional(),
  invitationExpiresAt: z.iso.datetime().optional(),
  invitationConsumedAt: z.iso.datetime().optional(),
  invitationSendCount: z.number().int().nonnegative(),
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
    archived: z
      .preprocess((value) => value === true || value === 'true', z.boolean())
      .default(false),
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

export const createOrganisationInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
}) satisfies z.ZodType<CreateOrganisationInput>;

export const createOrganisationContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  body: createOrganisationInputSchema,
  output: hektorResponseSchema(organisationSummarySchema),
});

export const updateOrganisationInputSchema =
  createOrganisationInputSchema.extend({
    expectedStatus: z.enum(OrganisationStatus),
    status: z.enum(OrganisationStatus),
  }) satisfies z.ZodType<UpdateOrganisationInput>;

export const updateOrganisationContract = defineContract({
  method: 'PATCH',
  path: '/api/admin/organisations/:organisationId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  body: updateOrganisationInputSchema,
  output: hektorResponseSchema(organisationSummarySchema),
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

export const createOrganisationContractPeriodInputSchema = z
  .object({
    endsOn: z.iso.date(),
    learnerSeatAllowance: z.number().int().nonnegative(),
    startsOn: z.iso.date(),
  })
  .refine(({ endsOn, startsOn }) => endsOn > startsOn, {
    message: 'End date must be after start date',
    path: ['endsOn'],
  }) satisfies z.ZodType<CreateOrganisationContractPeriodInput>;

export const createOrganisationContractPeriodContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/contract-periods',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  body: createOrganisationContractPeriodInputSchema,
  output: hektorResponseSchema(contractPeriodSchema),
});

export const getOrganisationContractPeriodContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/contract-periods/:contractPeriodId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), contractPeriodId: z.uuid() }),
  output: hektorResponseSchema(contractPeriodSchema),
});

export const updateOrganisationContractPeriodInputSchema =
  createOrganisationContractPeriodInputSchema.and(
    z.object({ expectedUpdatedAt: z.iso.datetime() }),
  ) satisfies z.ZodType<UpdateOrganisationContractPeriodInput>;

export const updateOrganisationContractPeriodContract = defineContract({
  method: 'PATCH',
  path: '/api/admin/organisations/:organisationId/contract-periods/:contractPeriodId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), contractPeriodId: z.uuid() }),
  body: updateOrganisationContractPeriodInputSchema,
  output: hektorResponseSchema(contractPeriodSchema),
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

export const createOrganisationCohortInputSchema = z
  .object({
    endsOn: z.iso.date(),
    name: z.string().trim().min(1).max(255),
    startsOn: z.iso.date(),
  })
  .refine(({ endsOn, startsOn }) => endsOn > startsOn, {
    message: 'End date must be after start date',
    path: ['endsOn'],
  }) satisfies z.ZodType<CreateOrganisationCohortInput>;

export const createOrganisationCohortContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/cohorts',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  body: createOrganisationCohortInputSchema,
  output: hektorResponseSchema(organisationCohortSchema),
});

export const updateOrganisationCohortInputSchema =
  createOrganisationCohortInputSchema.and(
    z.object({
      expectedUpdatedAt: z.iso.datetime(),
      status: z.enum(GroupStatus),
    }),
  ) satisfies z.ZodType<UpdateOrganisationCohortInput>;

export const updateOrganisationCohortContract = defineContract({
  method: 'PATCH',
  path: '/api/admin/organisations/:organisationId/cohorts/:cohortId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), cohortId: z.uuid() }),
  body: updateOrganisationCohortInputSchema,
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

export const createOrganisationGroupInputSchema = z.object({
  cohortId: z.uuid().optional(),
  name: z.string().trim().min(1).max(255),
}) satisfies z.ZodType<CreateOrganisationGroupInput>;

export const createOrganisationGroupContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/groups',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  body: createOrganisationGroupInputSchema,
  output: hektorResponseSchema(organisationGroupSchema),
});

export const updateOrganisationGroupInputSchema =
  createOrganisationGroupInputSchema.and(
    z.object({
      expectedUpdatedAt: z.iso.datetime(),
      status: z.enum(GroupStatus),
    }),
  ) satisfies z.ZodType<UpdateOrganisationGroupInput>;

export const updateOrganisationGroupContract = defineContract({
  method: 'PATCH',
  path: '/api/admin/organisations/:organisationId/groups/:groupId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), groupId: z.uuid() }),
  body: updateOrganisationGroupInputSchema,
  output: hektorResponseSchema(organisationGroupSchema),
});

const uniqueUuidArraySchema = z
  .array(z.uuid())
  .max(500)
  .refine((values) => new Set(values).size === values.length, {
    message: 'Identifiers must be unique',
  });

export const updateOrganisationGroupMembershipInputSchema = z
  .object({
    addProvisionIds: uniqueUuidArraySchema,
    addUserIds: uniqueUuidArraySchema,
    removeProvisionIds: uniqueUuidArraySchema,
    removeUserIds: uniqueUuidArraySchema,
  })
  .refine(
    ({ addProvisionIds, removeProvisionIds }) =>
      !addProvisionIds.some((id) => removeProvisionIds.includes(id)),
    { message: 'A provision cannot be added and removed together' },
  )
  .refine(
    ({ addUserIds, removeUserIds }) =>
      !addUserIds.some((id) => removeUserIds.includes(id)),
    { message: 'A user cannot be added and removed together' },
  ) satisfies z.ZodType<UpdateOrganisationGroupMembershipInput>;

export const updateOrganisationGroupMembershipContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/groups/:groupId/memberships',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), groupId: z.uuid() }),
  body: updateOrganisationGroupMembershipInputSchema,
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

export const organisationMembershipCandidateSchema = userSummarySchema.extend({
  pendingProvision: z
    .object({ id: z.uuid(), role: z.enum(OrganisationRole) })
    .optional(),
}) satisfies z.ZodType<OrganisationMembershipCandidate>;

export const listOrganisationMembershipCandidatesContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/users/candidates',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  query: paginationQuerySchema.extend({
    order: z.literal('displayName').default('displayName'),
    query: z.string().trim().min(1).optional(),
  }),
  output: hektorCollectionResponseSchema(
    z.array(organisationMembershipCandidateSchema),
  ),
});

export const createOrganisationMembershipsInputSchema = z.object({
  cohortId: z.uuid().optional(),
  role: z.enum(OrganisationRole),
  userIds: uniqueUuidArraySchema.min(1).max(100),
}) satisfies z.ZodType<CreateOrganisationMembershipsInput>;

export const createOrganisationMembershipsResultSchema = z.object({
  membershipIds: z.array(z.uuid()),
  reconciledProvisionIds: z.array(z.uuid()),
}) satisfies z.ZodType<CreateOrganisationMembershipsResult>;

export const createOrganisationMembershipsContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/users',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  body: createOrganisationMembershipsInputSchema,
  output: hektorResponseSchema(createOrganisationMembershipsResultSchema),
});

export const createOrganisationUserInputSchema = z.object({
  cohortId: z.uuid().optional(),
  email: z.email(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  role: z.enum(OrganisationRole),
}) satisfies z.ZodType<CreateOrganisationUserInput>;

export const createOrganisationUserResultSchema = z.object({
  membershipId: z.uuid(),
  userId: z.uuid(),
}) satisfies z.ZodType<CreateOrganisationUserResult>;

export const createOrganisationUserContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/users/new',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  body: createOrganisationUserInputSchema,
  output: hektorResponseSchema(createOrganisationUserResultSchema),
});

export const organisationProvisionImportRowSchema = z.object({
  cohortName: z.string().trim().min(1).max(255).optional(),
  email: z.email(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  role: z.enum(OrganisationRole),
  rowNumber: z.number().int().positive(),
}) satisfies z.ZodType<OrganisationProvisionImportRow>;

export const organisationProvisionImportRowReviewSchema =
  organisationProvisionImportRowSchema.extend({
    action: z.enum(OrganisationProvisionImportAction),
    message: z.string().min(1).optional(),
  }) satisfies z.ZodType<OrganisationProvisionImportRowReview>;

export const organisationProvisionImportPreviewSchema = z.object({
  rows: z.array(organisationProvisionImportRowReviewSchema),
  summary: z.object({
    errors: z.number().int().nonnegative(),
    ready: z.number().int().nonnegative(),
    unchanged: z.number().int().nonnegative(),
  }),
}) satisfies z.ZodType<OrganisationProvisionImportPreview>;

export const organisationProvisionImportResultSchema = z.object({
  created: z.number().int().nonnegative(),
  invitationsFailed: z.number().int().nonnegative(),
  invitationsSent: z.number().int().nonnegative(),
  linked: z.number().int().nonnegative(),
  unchanged: z.number().int().nonnegative(),
}) satisfies z.ZodType<OrganisationProvisionImportResult>;

export const previewOrganisationProvisionImportContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/user-provisions/import/preview',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  body: z.object({
    rows: z.array(organisationProvisionImportRowSchema).min(1).max(500),
  }),
  output: hektorResponseSchema(organisationProvisionImportPreviewSchema),
});

export const commitOrganisationProvisionImportContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/user-provisions/import',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  body: z.object({
    rows: z.array(organisationProvisionImportRowSchema).min(1).max(500),
    sendInvitations: z.boolean(),
  }),
  output: hektorResponseSchema(organisationProvisionImportResultSchema),
});

export const getOrganisationMembershipContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/users/:membershipId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), membershipId: z.uuid() }),
  output: hektorResponseSchema(organisationMembershipSchema),
});

export const updateOrganisationMembershipInputSchema = z.object({
  cohortId: z.uuid().optional(),
  expectedUpdatedAt: z.iso.datetime(),
  role: z.enum(OrganisationRole),
  status: z.enum(OrganisationUserStatus),
}) satisfies z.ZodType<UpdateOrganisationMembershipInput>;

export const updateOrganisationMembershipContract = defineContract({
  method: 'PATCH',
  path: '/api/admin/organisations/:organisationId/users/:membershipId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), membershipId: z.uuid() }),
  body: updateOrganisationMembershipInputSchema,
  output: hektorResponseSchema(organisationMembershipSchema),
});

export const listOrganisationUserProvisionsContract = defineContract({
  method: 'GET',
  path: '/api/admin/organisations/:organisationId/user-provisions',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  query: paginationQuerySchema.extend({
    order: z.enum(['displayName', 'role']).default('displayName'),
    provisioningMethod: z.enum(ProvisioningMethod).optional(),
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

export const provisioningLifecycleResultSchema = z.object({
  id: z.uuid(),
  status: z.enum(ProvisioningStatus),
}) satisfies z.ZodType<ProvisioningLifecycleResult>;

export const transitionOrganisationUserProvisionContract = defineContract({
  method: 'PATCH',
  path: '/api/admin/organisations/:organisationId/user-provisions/:provisionId/lifecycle',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), provisionId: z.uuid() }),
  body: z.object({
    action: z.enum(ProvisioningLifecycleAction),
    expectedStatus: z.enum(ProvisioningStatus),
    organisationUserId: z.uuid().optional(),
  }),
  output: hektorResponseSchema(provisioningLifecycleResultSchema),
});

export const provisioningAutoLinkResultSchema = z.object({
  outcome: z.enum(ProvisioningAutoLinkOutcome),
  organisationUserId: z.uuid().optional(),
}) satisfies z.ZodType<ProvisioningAutoLinkResult>;

export const autoLinkOrganisationUserProvisionContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/user-provisions/:provisionId/auto-link',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), provisionId: z.uuid() }),
  body: emptyObjectSchema,
  output: hektorResponseSchema(provisioningAutoLinkResultSchema),
});

export const organisationProvisionInvitationResultSchema = z.object({
  expiresAt: z.iso.datetime(),
  sendCount: z.number().int().positive(),
  sentAt: z.iso.datetime(),
}) satisfies z.ZodType<OrganisationProvisionInvitationResult>;

export const sendOrganisationProvisionInvitationContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/user-provisions/:provisionId/invitation',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid(), provisionId: z.uuid() }),
  body: emptyObjectSchema,
  output: hektorResponseSchema(organisationProvisionInvitationResultSchema),
});

export const organisationBulkInvitationItemResultSchema = z.object({
  email: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  outcome: z.enum(OrganisationBulkInvitationOutcome),
  provisionId: z.uuid(),
}) satisfies z.ZodType<OrganisationBulkInvitationItemResult>;

export const organisationBulkInvitationResultSchema = z.object({
  failed: z.number().int().nonnegative(),
  items: z.array(organisationBulkInvitationItemResultSchema),
  sent: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
}) satisfies z.ZodType<OrganisationBulkInvitationResult>;

export const sendOrganisationProvisionInvitationsContract = defineContract({
  method: 'POST',
  path: '/api/admin/organisations/:organisationId/user-provisions/invitations',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ organisationId: z.uuid() }),
  body: z.object({
    selection: z.discriminatedUnion('type', [
      z.object({
        ids: z
          .array(z.uuid())
          .min(1)
          .max(500)
          .refine((ids) => new Set(ids).size === ids.length, {
            message: 'Provision identifiers must be unique',
          }),
        type: z.literal('ids'),
      }),
      z.object({
        provisioningMethod: z.enum(ProvisioningMethod).optional(),
        query: z.string().trim().min(1).optional(),
        role: z.enum(OrganisationRole).optional(),
        type: z.literal('filter'),
      }),
    ]),
  }),
  output: hektorResponseSchema(organisationBulkInvitationResultSchema),
});

export const getProvisionAcceptanceContract = defineContract({
  method: 'GET',
  path: '/api/provisioning/:provisionId',
  access: { type: 'authenticated' },
  params: z.object({ provisionId: z.uuid() }),
  output: hektorResponseSchema(organisationUserProvisionDetailSchema),
});

export const acceptOrganisationUserProvisionContract = defineContract({
  method: 'POST',
  path: '/api/provisioning/:provisionId/accept',
  access: { type: 'authenticated' },
  params: z.object({ provisionId: z.uuid() }),
  body: emptyObjectSchema,
  output: hektorResponseSchema(provisioningLifecycleResultSchema),
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

export type CreateOrganisationBody = ContractBody<
  typeof createOrganisationContract
>;

export type CreateOrganisationResponse = ContractOutput<
  typeof createOrganisationContract
>;

export type UpdateOrganisationBody = ContractBody<
  typeof updateOrganisationContract
>;

export type UpdateOrganisationResponse = ContractOutput<
  typeof updateOrganisationContract
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

export type CreateOrganisationContractPeriodParams = ContractParams<
  typeof createOrganisationContractPeriodContract
>;

export type CreateOrganisationContractPeriodBody = ContractBody<
  typeof createOrganisationContractPeriodContract
>;

export type CreateOrganisationContractPeriodResponse = ContractOutput<
  typeof createOrganisationContractPeriodContract
>;

export type GetOrganisationContractPeriodParams = ContractParams<
  typeof getOrganisationContractPeriodContract
>;

export type GetOrganisationContractPeriodResponse = ContractOutput<
  typeof getOrganisationContractPeriodContract
>;

export type UpdateOrganisationContractPeriodParams = ContractParams<
  typeof updateOrganisationContractPeriodContract
>;

export type UpdateOrganisationContractPeriodBody = ContractBody<
  typeof updateOrganisationContractPeriodContract
>;

export type UpdateOrganisationContractPeriodResponse = ContractOutput<
  typeof updateOrganisationContractPeriodContract
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

export type CreateOrganisationCohortParams = ContractParams<
  typeof createOrganisationCohortContract
>;

export type CreateOrganisationCohortBody = ContractBody<
  typeof createOrganisationCohortContract
>;

export type CreateOrganisationCohortResponse = ContractOutput<
  typeof createOrganisationCohortContract
>;

export type UpdateOrganisationCohortParams = ContractParams<
  typeof updateOrganisationCohortContract
>;

export type UpdateOrganisationCohortBody = ContractBody<
  typeof updateOrganisationCohortContract
>;

export type UpdateOrganisationCohortResponse = ContractOutput<
  typeof updateOrganisationCohortContract
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

export type CreateOrganisationGroupParams = ContractParams<
  typeof createOrganisationGroupContract
>;

export type CreateOrganisationGroupBody = ContractBody<
  typeof createOrganisationGroupContract
>;

export type CreateOrganisationGroupResponse = ContractOutput<
  typeof createOrganisationGroupContract
>;

export type UpdateOrganisationGroupParams = ContractParams<
  typeof updateOrganisationGroupContract
>;

export type UpdateOrganisationGroupBody = ContractBody<
  typeof updateOrganisationGroupContract
>;

export type UpdateOrganisationGroupResponse = ContractOutput<
  typeof updateOrganisationGroupContract
>;

export type UpdateOrganisationGroupMembershipParams = ContractParams<
  typeof updateOrganisationGroupMembershipContract
>;

export type UpdateOrganisationGroupMembershipBody = ContractBody<
  typeof updateOrganisationGroupMembershipContract
>;

export type UpdateOrganisationGroupMembershipResponse = ContractOutput<
  typeof updateOrganisationGroupMembershipContract
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

export type ListOrganisationMembershipCandidatesParams = ContractParams<
  typeof listOrganisationMembershipCandidatesContract
>;

export type ListOrganisationMembershipCandidatesQuery = ContractQuery<
  typeof listOrganisationMembershipCandidatesContract
>;

export type ListOrganisationMembershipCandidatesResponse = ContractOutput<
  typeof listOrganisationMembershipCandidatesContract
>;

export type CreateOrganisationMembershipsParams = ContractParams<
  typeof createOrganisationMembershipsContract
>;

export type CreateOrganisationMembershipsBody = ContractBody<
  typeof createOrganisationMembershipsContract
>;

export type CreateOrganisationMembershipsResponse = ContractOutput<
  typeof createOrganisationMembershipsContract
>;

export type CreateOrganisationUserParams = ContractParams<
  typeof createOrganisationUserContract
>;

export type CreateOrganisationUserBody = ContractBody<
  typeof createOrganisationUserContract
>;

export type CreateOrganisationUserResponse = ContractOutput<
  typeof createOrganisationUserContract
>;

export type PreviewOrganisationProvisionImportParams = ContractParams<
  typeof previewOrganisationProvisionImportContract
>;

export type PreviewOrganisationProvisionImportBody = ContractBody<
  typeof previewOrganisationProvisionImportContract
>;

export type PreviewOrganisationProvisionImportResponse = ContractOutput<
  typeof previewOrganisationProvisionImportContract
>;

export type CommitOrganisationProvisionImportParams = ContractParams<
  typeof commitOrganisationProvisionImportContract
>;

export type CommitOrganisationProvisionImportBody = ContractBody<
  typeof commitOrganisationProvisionImportContract
>;

export type CommitOrganisationProvisionImportResponse = ContractOutput<
  typeof commitOrganisationProvisionImportContract
>;

export type GetOrganisationMembershipParams = ContractParams<
  typeof getOrganisationMembershipContract
>;

export type GetOrganisationMembershipResponse = ContractOutput<
  typeof getOrganisationMembershipContract
>;

export type UpdateOrganisationMembershipParams = ContractParams<
  typeof updateOrganisationMembershipContract
>;

export type UpdateOrganisationMembershipBody = ContractBody<
  typeof updateOrganisationMembershipContract
>;

export type UpdateOrganisationMembershipResponse = ContractOutput<
  typeof updateOrganisationMembershipContract
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

export type TransitionOrganisationUserProvisionBody = ContractBody<
  typeof transitionOrganisationUserProvisionContract
>;

export type TransitionOrganisationUserProvisionResponse = ContractOutput<
  typeof transitionOrganisationUserProvisionContract
>;

export type AutoLinkOrganisationUserProvisionResponse = ContractOutput<
  typeof autoLinkOrganisationUserProvisionContract
>;

export type SendOrganisationProvisionInvitationResponse = ContractOutput<
  typeof sendOrganisationProvisionInvitationContract
>;

export type SendOrganisationProvisionInvitationsBody = ContractBody<
  typeof sendOrganisationProvisionInvitationsContract
>;

export type SendOrganisationProvisionInvitationsParams = ContractParams<
  typeof sendOrganisationProvisionInvitationsContract
>;

export type SendOrganisationProvisionInvitationsResponse = ContractOutput<
  typeof sendOrganisationProvisionInvitationsContract
>;

export type GetProvisionAcceptanceResponse = ContractOutput<
  typeof getProvisionAcceptanceContract
>;

export type AcceptOrganisationUserProvisionResponse = ContractOutput<
  typeof acceptOrganisationUserProvisionContract
>;
