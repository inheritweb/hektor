import { z } from 'zod';

import {
  OrganisationRole,
  type OrganisationMembershipSummary,
  OrganisationStatus,
  OrganisationUserStatus,
} from '../organisations';
import {
  IdentityProvider,
  PlatformRole,
  type CurrentUser,
  type UserIdentity,
  type UserListItem,
  type UserSummary,
  type CreateUserInput,
  type UpdateUserInput,
  UserStatus,
} from '../users';
import {
  type ContractOutput,
  type ContractBody,
  type ContractParams,
  type ContractQuery,
  defineContract,
  hektorCollectionResponseSchema,
  hektorResponseSchema,
  paginationQuerySchema,
  SortDirection,
} from './base';

export const userIdentitySchema = z.object({
  id: z.string().min(1),
  provider: z.enum(IdentityProvider),
  email: z.email().optional(),
  createdAt: z.iso.datetime().optional(),
  lastSignInAt: z.iso.datetime().optional(),
}) satisfies z.ZodType<UserIdentity>;

export const organisationMembershipSummarySchema = z.object({
  id: z.uuid(),
  organisation: z.object({
    id: z.uuid(),
    name: z.string().min(1),
    slug: z.string().min(1),
    status: z.enum(OrganisationStatus),
  }),
  role: z.enum(OrganisationRole),
  status: z.enum(OrganisationUserStatus),
}) satisfies z.ZodType<OrganisationMembershipSummary>;

export const userSummarySchema = z.object({
  id: z.uuid(),
  displayName: z.string().min(1),
  platformRole: z.enum(PlatformRole).optional(),
  email: z.email().optional(),
  avatarUrl: z.url().optional(),
}) satisfies z.ZodType<UserSummary>;

export const userListItemSchema = userSummarySchema.extend({
  status: z.enum(UserStatus),
  createdAt: z.iso.datetime(),
  identityProviders: z.array(z.enum(IdentityProvider)),
  lastSignInAt: z.iso.datetime().optional(),
  membershipCount: z.number().int().nonnegative(),
}) satisfies z.ZodType<UserListItem>;

export const userSchema = userSummarySchema.extend({
  status: z.enum(UserStatus),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  identities: z.array(userIdentitySchema),
  memberships: z.array(organisationMembershipSummarySchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<CurrentUser>;

export const currentUserSchema = userSchema;

export const getCurrentUserContract = defineContract({
  method: 'GET',
  path: '/api/me',
  access: { type: 'authenticated' },
  output: hektorResponseSchema(currentUserSchema),
});

export const listUsersContract = defineContract({
  method: 'GET',
  path: '/api/admin/users',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  query: paginationQuerySchema.extend({
    order: z.literal('createdAt').default('createdAt'),
    dir: z.literal(SortDirection.Descending).default(SortDirection.Descending),
    status: z.enum(UserStatus).optional(),
  }),
  output: hektorCollectionResponseSchema(z.array(userListItemSchema)),
});

export const createUserInputSchema = z.object({
  email: z.email(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  platformRole: z.enum(PlatformRole).optional(),
}) satisfies z.ZodType<CreateUserInput>;

export const createUserContract = defineContract({
  method: 'POST',
  path: '/api/admin/users',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  body: createUserInputSchema,
  output: hektorResponseSchema(userSchema),
});

export const getUserContract = defineContract({
  method: 'GET',
  path: '/api/admin/users/:userId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ userId: z.uuid() }),
  output: hektorResponseSchema(userSchema),
});

export const updateUserInputSchema = z.object({
  expectedUpdatedAt: z.iso.datetime(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  platformRole: z.enum(PlatformRole).optional(),
  status: z.enum(UserStatus),
}) satisfies z.ZodType<UpdateUserInput>;

export const updateUserContract = defineContract({
  method: 'PATCH',
  path: '/api/admin/users/:userId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ userId: z.uuid() }),
  body: updateUserInputSchema,
  output: hektorResponseSchema(userSchema),
});

export type GetCurrentUserResponse = ContractOutput<
  typeof getCurrentUserContract
>;

export type ListUsersQuery = ContractQuery<typeof listUsersContract>;

export type ListUsersResponse = ContractOutput<typeof listUsersContract>;

export type CreateUserBody = ContractBody<typeof createUserContract>;

export type CreateUserResponse = ContractOutput<typeof createUserContract>;

export type GetUserParams = ContractParams<typeof getUserContract>;

export type GetUserResponse = ContractOutput<typeof getUserContract>;

export type UpdateUserBody = ContractBody<typeof updateUserContract>;

export type UpdateUserParams = ContractParams<typeof updateUserContract>;

export type UpdateUserResponse = ContractOutput<typeof updateUserContract>;
