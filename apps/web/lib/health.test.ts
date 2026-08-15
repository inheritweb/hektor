import { describe, expect, it } from 'vitest';

import { HealthStatus } from '@hektor/types';

import { isHealthy } from './health';

describe('isHealthy', () => {
  it('only accepts the ok status', () => {
    expect(isHealthy(HealthStatus.Ok)).toBe(true);
    expect(isHealthy(HealthStatus.Degraded)).toBe(false);
    expect(isHealthy(HealthStatus.Unavailable)).toBe(false);
  });
});
