import { describe, expect, it } from 'vitest';

import { isHealthy } from './health';

describe('isHealthy', () => {
  it('only accepts the ok status', () => {
    expect(isHealthy('ok')).toBe(true);
    expect(isHealthy('degraded')).toBe(false);
    expect(isHealthy('unavailable')).toBe(false);
  });
});
