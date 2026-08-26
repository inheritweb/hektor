import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import type {
  ApiMethodArguments,
  ApiMethodHasVariables,
  ApiMethodVariables,
  HektorApiError,
  RegisteredApiMethod,
} from '@hektor/api-client';
import type {
  AnyHektorContract,
  ContractOutput,
} from '@hektor/types/contracts';

import { useApiClient } from './provider';

type QueryOptions<TOutput> = Omit<
  UseQueryOptions<TOutput, HektorApiError>,
  'queryKey' | 'queryFn'
>;

type QueryArguments<TContract extends AnyHektorContract> =
  ApiMethodHasVariables<TContract> extends true
    ? [
        variables: ApiMethodVariables<TContract>,
        options?: QueryOptions<ContractOutput<TContract>>,
      ]
    : [
        variables?: ApiMethodVariables<TContract>,
        options?: QueryOptions<ContractOutput<TContract>>,
      ];

type QueryHook<TContract extends AnyHektorContract> = (
  ...arguments_: QueryArguments<TContract>
) => UseQueryResult<ContractOutput<TContract>, HektorApiError>;

export function makeQuery<TContract extends AnyHektorContract>(
  method: RegisteredApiMethod<TContract>,
  baseKey: QueryKey,
): QueryHook<TContract> {
  const useRegisteredQuery = (
    variables?: ApiMethodVariables<TContract>,
    options?: QueryOptions<ContractOutput<TContract>>,
  ) => {
    const client = useApiClient();
    return useQuery({
      ...options,
      queryKey: [
        ...baseKey,
        method.contract.method,
        method.contract.path,
        variables,
      ],
      queryFn: () =>
        method(
          client,
          ...((variables === undefined
            ? []
            : [variables]) as ApiMethodArguments<TContract>),
        ),
    });
  };

  return useRegisteredQuery as QueryHook<TContract>;
}
