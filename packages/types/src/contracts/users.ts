import { z } from 'zod';

import {
  OrganisationRole,
  type OrganisationMembershipSummary,
  OrganisationStatus,
  OrganisationUserStatus,
  ScimResourceStatus,
} from '../organisations';
import {
  IdentityProvider,
  PlatformRole,
  type CurrentUser,
  type UserIdentity,
  type UserListItem,
  type UserSummary,
} from '../users';
import {
  type ContractOutput,
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
  provisioningStatus: z.enum(ScimResourceStatus),
  institutionalUserName: z.string().min(1),
}) satisfies z.ZodType<OrganisationMembershipSummary>;

export const userSummarySchema = z.object({
  id: z.uuid(),
  displayName: z.string().min(1),
  platformRole: z.enum(PlatformRole).optional(),
  email: z.email().optional(),
  avatarUrl: z.url().optional(),
}) satisfies z.ZodType<UserSummary>;

export const userListItemSchema = userSummarySchema.extend({
  createdAt: z.iso.datetime(),
  identityProviders: z.array(z.enum(IdentityProvider)),
  lastSignInAt: z.iso.datetime().optional(),
  membershipCount: z.number().int().nonnegative(),
}) satisfies z.ZodType<UserListItem>;

export const userSchema = userSummarySchema.extend({
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
  }),
  output: hektorCollectionResponseSchema(z.array(userListItemSchema)),
});

export const getUserContract = defineContract({
  method: 'GET',
  path: '/api/admin/users/:userId',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  params: z.object({ userId: z.uuid() }),
  output: hektorResponseSchema(userSchema),
});

export type GetCurrentUserResponse = ContractOutput<
  typeof getCurrentUserContract
>;

export type ListUsersQuery = ContractQuery<typeof listUsersContract>;

export type ListUsersResponse = ContractOutput<typeof listUsersContract>;

export type GetUserParams = ContractParams<typeof getUserContract>;

export type GetUserResponse = ContractOutput<typeof getUserContract>;
