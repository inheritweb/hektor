import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LuHouse } from 'react-icons/lu';

import { AppMenuItem } from './AppMenuItem.component';

describe('AppMenuItem', () => {
  it('renders navigation as a native link without a Base UI warning', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(<AppMenuItem href="/home" icon={LuHouse} label="Home" />);

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/home');
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
