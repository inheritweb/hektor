'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemePreference = 'light' | 'system' | 'dark';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

export interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultPreference?: ThemePreference;
  storageKey?: string;
}

const DEFAULT_STORAGE_KEY = 'hektor-theme';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'system' || value === 'dark';
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ThemeProvider({
  children,
  defaultPreference = 'system',
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeProviderProps) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(defaultPreference);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => setSystemTheme(getSystemTheme());
    const storedPreference = window.localStorage.getItem(storageKey);

    updateSystemTheme();
    if (isThemePreference(storedPreference)) {
      setPreferenceState(storedPreference);
    }

    mediaQuery.addEventListener('change', updateSystemTheme);
    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, [storageKey]);

  const resolvedTheme = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setPreference = useCallback(
    (nextPreference: ThemePreference) => {
      setPreferenceState(nextPreference);
      window.localStorage.setItem(storageKey, nextPreference);
    },
    [storageKey],
  );

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
