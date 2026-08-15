import { HealthStatus } from '@hektor/types';

export function isHealthy(status: HealthStatus): boolean {
  return status === HealthStatus.Ok;
}
