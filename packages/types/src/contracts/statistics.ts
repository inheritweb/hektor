import { z } from 'zod';

import { OrganisationRole } from '../organisations';
import type { OrganisationStatistics, PlatformStatistics } from '../statistics';
import { PlatformRole } from '../users';
import { defineContract, hektorResponseSchema } from './base';

export const platformStatisticsSchema = z.object({
  organisationCount: z.number().int().nonnegative(),
  userCount: z.number().int().nonnegative(),
}) satisfies z.ZodType<PlatformStatistics>;

export const organisationStatisticsSchema = z.object({
  cohortCount: z.number().int().nonnegative(),
  groupCount: z.number().int().nonnegative(),
  provisionCount: z.number().int().nonnegative(),
  userCount: z.number().int().nonnegative(),
}) satisfies z.ZodType<OrganisationStatistics>;

export const getPlatformStatisticsContract = defineContract({
  method: 'GET',
  path: '/api/admin/statistics',
  access: { type: 'platform', roles: [PlatformRole.Admin] },
  output: hektorResponseSchema(platformStatisticsSchema),
});

export const getOrganisationStatisticsContract = defineContract({
  method: 'GET',
  path: '/api/organisation/statistics',
  access: { type: 'tenant', roles: [OrganisationRole.OrganisationAdmin] },
  output: hektorResponseSchema(organisationStatisticsSchema),
});
