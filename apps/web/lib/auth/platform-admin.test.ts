import { describe, expect, it } from 'vitest';

import type { User } from '@supabase/supabase-js';

import {
  canBootstrapPlatformAdmin,
  isPlatformAdmin,
  platformAdminEmails,
} from './platform-admin-policy';

function user(overrides: Partial<User> = {}): User {
  return {
    id: 'user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-08-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('platform administrator authorization', () => {
  it('normalizes the bootstrap allow-list', () => {
    expect(
      platformAdminEmails(' Admin@Example.com,second@example.com '),
    ).toEqual(new Set(['admin@example.com', 'second@example.com']));
  });

  it('requires both an allowed email and a Google identity for bootstrap', () => {
    const candidate = user({
      email: 'admin@example.com',
      identities: [{ provider: 'google' }] as User['identities'],
    });

    expect(
      canBootstrapPlatformAdmin(candidate, new Set(['admin@example.com'])),
    ).toBe(true);
    expect(canBootstrapPlatformAdmin(candidate, new Set())).toBe(false);
    expect(
      canBootstrapPlatformAdmin(
        user({ email: 'admin@example.com', identities: [] }),
        new Set(['admin@example.com']),
      ),
    ).toBe(false);
  });

  it('trusts only server-controlled app metadata for authorization', () => {
    expect(isPlatformAdmin(user({ app_metadata: { role: 'admin' } }))).toBe(
      true,
    );
    expect(isPlatformAdmin(user({ user_metadata: { role: 'admin' } }))).toBe(
      false,
    );
  });
});
