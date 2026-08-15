import { describe, expect, it } from 'vitest';

import { resolvePostLoginPath } from './redirects';

describe('post-login redirects', () => {
  it('allows configured internal destinations', () => {
    expect(resolvePostLoginPath('/')).toBe('/');
  });

  it('rejects unconfigured and external destinations', () => {
    expect(resolvePostLoginPath('/admin')).toBe('/');
    expect(resolvePostLoginPath('https://attacker.example')).toBe('/');
  });
});
