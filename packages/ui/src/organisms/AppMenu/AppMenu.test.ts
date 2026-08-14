import { describe, expect, it } from 'vitest';

import { nextAppMenuState } from './AppMenu.component';

describe('nextAppMenuState', () => {
  it('toggles between hidden and expanded on desktop', () => {
    expect(nextAppMenuState('hidden')).toBe('expanded');
    expect(nextAppMenuState('icons')).toBe('expanded');
    expect(nextAppMenuState('expanded')).toBe('hidden');
  });

  it('toggles between hidden and expanded on mobile', () => {
    expect(nextAppMenuState('hidden')).toBe('expanded');
    expect(nextAppMenuState('icons')).toBe('expanded');
    expect(nextAppMenuState('expanded')).toBe('hidden');
  });
});
