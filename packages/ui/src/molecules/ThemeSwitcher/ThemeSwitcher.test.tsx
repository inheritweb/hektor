import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '../../atoms/Tooltip';
import { ThemeProvider } from '../../context';

import { ThemeSwitcher } from './ThemeSwitcher.component';

afterEach(cleanup);

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
  });

  it('selects and stores a theme preference', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider storageKey="switcher-theme">
        <TooltipProvider>
          <ThemeSwitcher />
        </TooltipProvider>
      </ThemeProvider>,
    );

    const darkButton = screen.getByRole('button', { name: 'Use dark theme' });
    await user.click(darkButton);

    expect(darkButton.getAttribute('aria-pressed')).toBe('true');
    expect(window.localStorage.getItem('switcher-theme')).toBe('dark');
  });
});
