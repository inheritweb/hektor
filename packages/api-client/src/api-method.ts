import { z } from 'zod';

import type {
  AnyHektorContract,
  ContractOutput,
} from '@hektor/types/contracts';

import type { Client, RequestOptions } from './client';

type ValueForKey<
  TContract extends AnyHektorContract,
  TKey extends 'params' | 'query' | 'body',
> =
  TContract extends Record<TKey, infer TSchema>
    ? TSchema extends z.ZodType
      ? z.input<TSchema>
      : never
    : never;

type VariablesForKey<
  TContract extends AnyHektorContract,
  TKey extends 'params' | 'query' | 'body',
> = TKey extends keyof TContract
  ? { [TField in TKey]: ValueForKey<TContract, TKey> }
  : object;

type RequiredApiMethodVariables<TContract extends AnyHektorContract> =
  VariablesForKey<TContract, 'params'> &
    VariablesForKey<TContract, 'query'> &
    VariablesForKey<TContract, 'body'>;

export type ApiMethodHasVariables<TContract extends AnyHektorContract> =
  keyof RequiredApiMethodVariables<TContract> extends never ? false : true;

export type ApiMethodVariables<TContract extends AnyHektorContract> =
  RequiredApiMethodVariables<TContract> & {
    headers?: Record<string, string>;
  };

export type ApiMethodArguments<TContract extends AnyHektorContract> =
  ApiMethodHasVariables<TContract> extends true
    ? [variables: ApiMethodVariables<TContract>]
    : [variables?: ApiMethodVariables<TContract>];

export interface RegisteredApiMethod<TContract extends AnyHektorContract> {
  (
    client: Client,
    ...arguments_: ApiMethodArguments<TContract>
  ): Promise<ContractOutput<TContract>>;
  readonly contract: TContract;
}

export function registerApiMethod<TContract extends AnyHektorContract>(
  contract: TContract,
): RegisteredApiMethod<TContract> {
  const method = async (
    client: Client,
    variables?: ApiMethodVariables<TContract>,
  ) => {
    const payload = await client.request(
      contract.method,
      contract.path,
      variables as RequestOptions | undefined,
    );
    return contract.output.parse(payload) as ContractOutput<TContract>;
  };

  return Object.assign(method, { contract }) as RegisteredApiMethod<TContract>;
}
