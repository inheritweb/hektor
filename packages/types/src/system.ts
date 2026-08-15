export enum HealthStatus {
  Ok = 'ok',
  Degraded = 'degraded',
  Unavailable = 'unavailable',
}

export interface HealthCheck {
  status: HealthStatus;
}
