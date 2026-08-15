import { z } from 'zod';

import {
  OrganisationRole,
  OrganisationStatus,
  OrganisationUserStatus,
  ScimResourceStatus,
} from '../organisations';
import type { CurrentUser, UserIdentity, UserOrganisation } from '../users';
import {
  type ContractOutput,
  defineContract,
  hektorResponseSchema,
} from './base';

export const userIdentitySchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  email: z.email().optional(),
  createdAt: z.iso.datetime().optional(),
  lastSignInAt: z.iso.datetime().optional(),
}) satisfies z.ZodType<UserIdentity>;

export const userOrganisationSchema = z.object({
  membershipId: z.uuid(),
  id: z.uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(OrganisationStatus),
  role: z.enum(OrganisationRole),
  membershipStatus: z.enum(OrganisationUserStatus),
  scimStatus: z.enum(ScimResourceStatus),
  institutionalUserName: z.string().min(1),
}) satisfies z.ZodType<UserOrganisation>;

export const currentUserSchema = z.object({
  id: z.uuid(),
  displayName: z.string().min(1),
  isPlatformAdmin: z.boolean(),
  email: z.email().optional(),
  avatarUrl: z.url().optional(),
  identities: z.array(userIdentitySchema),
  organisations: z.array(userOrganisationSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<CurrentUser>;

export const getCurrentUserContract = defineContract({
  method: 'GET',
  path: '/api/me',
  output: hektorResponseSchema(currentUserSchema),
});

export type GetCurrentUserResponse = ContractOutput<
  typeof getCurrentUserContract
>;
