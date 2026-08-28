'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { Client, type ClientOptions } from '@hektor/api-client';

export const ACTIVE_ORGANISATION_STORAGE_KEY = 'hektor.activeOrganisationId';

export const ACTIVE_ORGANISATION_NAME_STORAGE_KEY =
  'hektor.activeOrganisationName';

export const ACTIVE_ORGANISATION_CHANGE_EVENT =
  'hektor-active-organisation-change';

const ApiClientContext = createContext<Client | undefined>(undefined);

interface QueryProviderProps extends PropsWithChildren {
  apiClient?: Client;
  apiClientOptions?: ClientOptions;
  queryClient?: QueryClient;
}

export function QueryProvider({
  apiClient,
  apiClientOptions,
  queryClient,
  children,
}: QueryProviderProps) {
  const [fallbackQueryClient] = useState(() => new QueryClient());
  const [fallbackApiClient] = useState(
    () =>
      new Client({
        getOrganisationId: () =>
          typeof window === 'undefined'
            ? undefined
            : (window.localStorage.getItem(ACTIVE_ORGANISATION_STORAGE_KEY) ??
              undefined),
        ...apiClientOptions,
      }),
  );
  const activeApiClient = apiClient ?? fallbackApiClient;
  const value = useMemo(() => activeApiClient, [activeApiClient]);

  return (
    <QueryClientProvider client={queryClient ?? fallbackQueryClient}>
      <ApiClientContext.Provider value={value}>
        {children}
      </ApiClientContext.Provider>
    </QueryClientProvider>
  );
}

export function useApiClient() {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within a QueryProvider');
  }
  return client;
}
