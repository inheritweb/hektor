import { getHealthCheck } from '@hektor/api-client/system';

import { makeQuery } from './make-query';

export const HEALTH_CHECK_QUERY_KEY = ['system', 'health-check'] as const;

export const useHealthCheck = makeQuery(getHealthCheck, HEALTH_CHECK_QUERY_KEY);
