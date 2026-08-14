import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from './ThemeContext';

const mediaListeners = new Set<() => void>();
let systemIsDark = false;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider menuStorageKey="menu-test" storageKey="theme-test">
      {children}
    </ThemeProvider>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    systemIsDark = false;
    mediaListeners.clear();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: systemIsDark,
        addEventListener: (_event: string, listener: () => void) =>
          mediaListeners.add(listener),
        removeEventListener: (_event: string, listener: () => void) =>
          mediaListeners.delete(listener),
      })),
    );
  });

  it('uses the system theme until a preference is chosen', async () => {
    systemIsDark = true;
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => expect(result.current.resolvedTheme).toBe('dark'));
    expect(result.current.preference).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('stores and applies an explicit preference', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current.setPreference('dark'));

    await waitFor(() =>
      expect(document.documentElement.classList.contains('dark')).toBe(true),
    );
    expect(window.localStorage.getItem('theme-test')).toBe('dark');
  });

  it('continues following system changes in system mode', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    await waitFor(() => expect(result.current.resolvedTheme).toBe('light'));

    systemIsDark = true;
    act(() => mediaListeners.forEach((listener) => listener()));

    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('restores and stores the menu state', async () => {
    window.localStorage.setItem('menu-test', 'expanded');
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => expect(result.current.menuState).toBe('expanded'));

    act(() => result.current.setMenuState('hidden'));

    expect(result.current.menuState).toBe('hidden');
    expect(window.localStorage.getItem('menu-test')).toBe('hidden');
  });
});
