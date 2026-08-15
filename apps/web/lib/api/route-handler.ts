import { z } from 'zod';
import type { SupabaseClient, User } from '@supabase/supabase-js';

import type { Database } from '@hektor/types/database';
import type {
  AnyHektorContract,
  ContractBody,
  ContractOutput,
  ContractParams,
  ContractQuery,
} from '@hektor/types/contracts';
import { HektorErrorCode } from '@hektor/types/contracts';
import {
  createServiceError,
  normaliseServiceError,
  toErrorResponse,
} from '@hektor/services';

interface RouteContext {
  params: Promise<Record<string, string>>;
}

type InputForKey<
  TContract extends AnyHektorContract,
  TKey extends 'params' | 'query' | 'body',
  TValue,
> = TKey extends keyof TContract ? { [TField in TKey]: TValue } : object;

type EndpointInput<TContract extends AnyHektorContract> = InputForKey<
  TContract,
  'params',
  ContractParams<TContract>
> &
  InputForKey<TContract, 'query', ContractQuery<TContract>> &
  InputForKey<TContract, 'body', ContractBody<TContract>>;

type ServerSupabaseClient = SupabaseClient<Database>;

type EndpointContext<TContract extends AnyHektorContract> = {
  request: Request;
} & (TContract['access'] extends { type: 'public' }
  ? object
  : { supabase: ServerSupabaseClient; user: User });

export type RegisteredEndpoint = (
  request: Request,
  context: RouteContext,
) => Promise<Response>;

function validationData(error: z.ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((issues, issue) => {
    const path = issue.path.join('.') || 'request';
    issues[path] = issue.message;
    return issues;
  }, {});
}

async function parseRequest<TContract extends AnyHektorContract>(
  contract: TContract,
  request: Request,
  context: RouteContext,
): Promise<EndpointInput<TContract>> {
  try {
    const methodHasBody = !['GET', 'HEAD'].includes(request.method);
    const rawBody = methodHasBody ? await request.json() : undefined;
    const url = new URL(request.url);

    return {
      ...(contract.params
        ? { params: contract.params.parse(await context.params) }
        : {}),
      ...(contract.query
        ? {
            query: contract.query.parse(Object.fromEntries(url.searchParams)),
          }
        : {}),
      ...(contract.body ? { body: contract.body.parse(rawBody) } : {}),
    } as EndpointInput<TContract>;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createServiceError(HektorErrorCode.UnprocessableEntity, {
        message: 'Request validation failed',
        data: validationData(error),
        cause: error,
      });
    }

    if (error instanceof SyntaxError) {
      throw createServiceError(HektorErrorCode.BadRequest, {
        message: 'Request body must be valid JSON',
        cause: error,
      });
    }

    throw error;
  }
}

async function authenticate(
  contract: AnyHektorContract,
  supabase: ServerSupabaseClient,
) {
  if (contract.access.type === 'public') return undefined;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw createServiceError(HektorErrorCode.Unauthorized, {
      message: 'You must be signed in',
      internalMessage: error?.message,
      cause: error,
    });
  }

  return user;
}

async function createSupabaseClient() {
  const { createClient } = await import('../supabase/server');

  return createClient();
}

async function authorize(
  contract: AnyHektorContract,
  input: object,
  user: User | undefined,
  supabase: ServerSupabaseClient | undefined,
) {
  const access = contract.access;

  if (access.type === 'public' || access.type === 'authenticated') return;

  if (
    access.type === 'platform' &&
    user &&
    access.roles.some((role) => role === user.app_metadata.role)
  ) {
    return;
  }

  if (access.type === 'organisation' && user && supabase) {
    const params = 'params' in input ? input.params : undefined;
    const organisationId =
      params && typeof params === 'object'
        ? (params as Record<string, unknown>)[access.organisationIdParam]
        : undefined;

    if (typeof organisationId !== 'string') {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'An unexpected error occurred',
        internalMessage: `Organisation access parameter "${access.organisationIdParam}" is not defined by the contract`,
      });
    }

    const { data, error } = await supabase.rpc('has_organisation_role', {
      target_organisation_id: organisationId,
      allowed_roles: [...access.roles],
    });

    if (error) throw error;
    if (data) return;
  }

  throw createServiceError(HektorErrorCode.Forbidden, {
    message: 'You do not have permission to perform this action',
  });
}

export function registerEndpoint<TContract extends AnyHektorContract>(
  contract: TContract,
  handler: (
    input: EndpointInput<TContract>,
    context: EndpointContext<TContract>,
  ) => Promise<ContractOutput<TContract>> | ContractOutput<TContract>,
): RegisteredEndpoint {
  return async (request: Request, context: RouteContext): Promise<Response> => {
    try {
      const supabase =
        contract.access.type === 'public'
          ? undefined
          : await createSupabaseClient();
      const user = supabase
        ? await authenticate(contract, supabase)
        : undefined;
      const input = await parseRequest(contract, request, context);
      await authorize(contract, input, user, supabase);
      const result = await handler(input, {
        request,
        ...(supabase ? { supabase } : {}),
        ...(user ? { user } : {}),
      } as EndpointContext<TContract>);
      const output = contract.output.safeParse(result);

      if (!output.success) {
        throw createServiceError(HektorErrorCode.InternalServerError, {
          message: 'An unexpected error occurred',
          internalMessage: 'Endpoint response failed contract validation',
          cause: output.error,
        });
      }

      return Response.json(output.data);
    } catch (error) {
      const serviceError = normaliseServiceError(error);

      if (serviceError.code >= HektorErrorCode.InternalServerError) {
        console.error('API endpoint failed', {
          method: contract.method,
          path: contract.path,
          message: serviceError.internalMessage,
          cause: serviceError.cause,
        });
      }

      return Response.json(toErrorResponse(serviceError), {
        status: serviceError.code,
      });
    }
  };
}
