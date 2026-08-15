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
} from '../users';
import {
  type ContractOutput,
  defineContract,
  hektorResponseSchema,
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

export const currentUserSchema = z.object({
  id: z.uuid(),
  displayName: z.string().min(1),
  platformRole: z.enum(PlatformRole).optional(),
  email: z.email().optional(),
  avatarUrl: z.url().optional(),
  identities: z.array(userIdentitySchema),
  memberships: z.array(organisationMembershipSummarySchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<CurrentUser>;

export const getCurrentUserContract = defineContract({
  method: 'GET',
  path: '/api/me',
  access: { type: 'authenticated' },
  output: hektorResponseSchema(currentUserSchema),
});

export type GetCurrentUserResponse = ContractOutput<
  typeof getCurrentUserContract
>;
