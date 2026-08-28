import { describe, expect, it } from 'vitest';

import { isAuthUserSuspended } from './user-status';

describe('authenticated user status', () => {
  it('treats a currently banned user as suspended', () => {
    expect(
      isAuthUserSuspended({ banned_until: '2126-08-28T00:00:00.000Z' }),
    ).toBe(true);
  });

  it('does not suspend users whose ban has elapsed', () => {
    expect(
      isAuthUserSuspended({ banned_until: '2020-08-28T00:00:00.000Z' }),
    ).toBe(false);
    expect(isAuthUserSuspended({})).toBe(false);
  });
});
