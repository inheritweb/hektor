import {
  getOrganisationStatistics,
  getPlatformStatistics,
} from '@hektor/api-client/statistics';

import { makeQuery } from './make-query';

export const PLATFORM_STATISTICS_QUERY_KEY = ['admin', 'statistics'] as const;

export const ORGANISATION_STATISTICS_QUERY_KEY = [
  'tenant',
  'organisation',
  'statistics',
] as const;

export const useGetPlatformStatistics = makeQuery(
  getPlatformStatistics,
  PLATFORM_STATISTICS_QUERY_KEY,
);

export const useGetOrganisationStatistics = makeQuery(
  getOrganisationStatistics,
  ORGANISATION_STATISTICS_QUERY_KEY,
);
