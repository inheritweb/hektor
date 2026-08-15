import { z } from 'zod';

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

export function registerEndpoint<TContract extends AnyHektorContract>(
  contract: TContract,
  handler: (
    input: EndpointInput<TContract>,
    request: Request,
  ) => Promise<ContractOutput<TContract>> | ContractOutput<TContract>,
): RegisteredEndpoint {
  return async (request: Request, context: RouteContext): Promise<Response> => {
    try {
      const input = await parseRequest(contract, request, context);
      const result = await handler(input, request);
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
