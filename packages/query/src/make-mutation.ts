import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';

import type {
  ApiMethodVariables,
  HektorApiError,
  RegisteredApiMethod,
} from '@hektor/api-client';
import type {
  AnyHektorContract,
  ContractOutput,
} from '@hektor/types/contracts';

import { useApiClient } from './provider';

type MutationOptions<TContract extends AnyHektorContract> = Omit<
  UseMutationOptions<
    ContractOutput<TContract>,
    HektorApiError,
    ApiMethodVariables<TContract>
  >,
  'mutationFn'
>;

export function makeMutation<TContract extends AnyHektorContract>(
  method: RegisteredApiMethod<TContract>,
  invalidateKey: QueryKey,
) {
  return (
    options?: MutationOptions<TContract>,
  ): UseMutationResult<
    ContractOutput<TContract>,
    HektorApiError,
    ApiMethodVariables<TContract>
  > => {
    const client = useApiClient();
    const queryClient = useQueryClient();
    return useMutation({
      ...options,
      mutationFn: (variables) => method(client, variables),
      onSuccess: async (...arguments_) => {
        await queryClient.invalidateQueries({ queryKey: invalidateKey });
        await options?.onSuccess?.(...arguments_);
      },
    });
  };
}
