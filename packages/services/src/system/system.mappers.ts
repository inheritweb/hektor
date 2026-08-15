import { type HealthCheck, type HealthStatus } from '@hektor/types/system';

export function mapHealthStatusToHealthCheck(
  status: HealthStatus,
): HealthCheck {
  return {
    status,
  };
}
