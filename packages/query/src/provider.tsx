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
  const [fallbackApiClient] = useState(() => new Client(apiClientOptions));
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
