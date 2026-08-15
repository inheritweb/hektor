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

export type MenuState = 'hidden' | 'icons' | 'expanded';

export interface ThemeContextValue {
  menuState: MenuState;
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setMenuState: (state: MenuState) => void;
  setPreference: (preference: ThemePreference) => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMenuState?: MenuState;
  defaultPreference?: ThemePreference;
  menuStorageKey?: string;
  storageKey?: string;
}

const DEFAULT_STORAGE_KEY = 'hektor-theme';

const DEFAULT_MENU_STORAGE_KEY = 'hektor-menu-state';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'system' || value === 'dark';
}

function isMenuState(value: string | null): value is MenuState {
  return value === 'hidden' || value === 'icons' || value === 'expanded';
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ThemeProvider({
  children,
  defaultMenuState = 'hidden',
  defaultPreference = 'system',
  menuStorageKey = DEFAULT_MENU_STORAGE_KEY,
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeProviderProps) {
  const [menuState, setMenuStateValue] = useState<MenuState>(defaultMenuState);
  const [preference, setPreferenceState] =
    useState<ThemePreference>(defaultPreference);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => setSystemTheme(getSystemTheme());
    const storedPreference = window.localStorage.getItem(storageKey);
    const storedMenuState = window.localStorage.getItem(menuStorageKey);

    updateSystemTheme();
    if (isThemePreference(storedPreference)) {
      setPreferenceState(storedPreference);
    }
    if (isMenuState(storedMenuState)) {
      setMenuStateValue(storedMenuState);
    }

    mediaQuery.addEventListener('change', updateSystemTheme);
    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, [menuStorageKey, storageKey]);

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

  const setMenuState = useCallback(
    (nextMenuState: MenuState) => {
      setMenuStateValue(nextMenuState);
      window.localStorage.setItem(menuStorageKey, nextMenuState);
    },
    [menuStorageKey],
  );

  const value = useMemo(
    () => ({
      menuState,
      preference,
      resolvedTheme,
      setMenuState,
      setPreference,
    }),
    [menuState, preference, resolvedTheme, setMenuState, setPreference],
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
