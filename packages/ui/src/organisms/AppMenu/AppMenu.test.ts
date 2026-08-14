import { describe, expect, it } from 'vitest';

import { nextAppMenuState } from './AppMenu.component';

describe('nextAppMenuState', () => {
  it('cycles through three desktop states', () => {
    expect(nextAppMenuState('hidden', true)).toBe('icons');
    expect(nextAppMenuState('icons', true)).toBe('expanded');
    expect(nextAppMenuState('expanded', true)).toBe('hidden');
  });

  it('toggles between hidden and expanded on mobile', () => {
    expect(nextAppMenuState('hidden', false)).toBe('expanded');
    expect(nextAppMenuState('icons', false)).toBe('expanded');
    expect(nextAppMenuState('expanded', false)).toBe('hidden');
  });
});
