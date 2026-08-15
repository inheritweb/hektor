import { z } from 'zod';

import { HealthStatus, type HealthCheck } from '../system';
import {
  type ContractOutput,
  defineContract,
  hektorResponseSchema,
} from './base';

export const healthStatusSchema = z.enum(HealthStatus);

export const healthCheckSchema = z.object({
  status: healthStatusSchema,
}) satisfies z.ZodType<HealthCheck>;

export const getHealthCheckContract = defineContract({
  method: 'GET',
  path: '/api/health-check',
  output: hektorResponseSchema(healthCheckSchema),
});

export type GetHealthCheckResponse = ContractOutput<
  typeof getHealthCheckContract
>;

export const getHealthCheckResponseSchema = getHealthCheckContract.output;
