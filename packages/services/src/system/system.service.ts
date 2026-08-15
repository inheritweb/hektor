import { HealthStatus, type HealthCheck } from '@hektor/types/system';

import { mapHealthStatusToHealthCheck } from './system.mappers';

export function getHealthCheck(): HealthCheck {
  return mapHealthStatusToHealthCheck(HealthStatus.Ok);
}
