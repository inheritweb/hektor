import { z } from 'zod';

import {
  SCIM_ERROR_SCHEMA,
  type ScimError,
  type ScimUserInput,
} from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';
import { createServiceError, normaliseServiceError } from '@hektor/services';
import { createScimService } from '@hektor/services/scim';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const scimUserInputSchema = z.object({
  active: z.boolean().optional(),
  displayName: z.string().trim().min(1).optional(),
  externalId: z.string().trim().min(1).optional(),
  name: z
    .object({
      familyName: z.string().trim().min(1).optional(),
      givenName: z.string().trim().min(1).optional(),
    })
    .optional(),
  schemas: z.array(z.string()).default([]),
  userName: z.email(),
}) satisfies z.ZodType<ScimUserInput>;

export function scimResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('content-type', 'application/scim+json');
  return Response.json(body, { ...init, headers });
}

function scimErrorResponse(error: unknown) {
  const normalized = normaliseServiceError(error);
  const status = normalized.code;
  const body: ScimError = {
    detail: normalized.message,
    schemas: [SCIM_ERROR_SCHEMA],
    ...(status === HektorErrorCode.Conflict ? { scimType: 'uniqueness' } : {}),
    status: String(status),
  };
  return scimResponse(body, {
    headers:
      status === HektorErrorCode.Unauthorized
        ? { 'www-authenticate': 'Bearer realm="Hektor SCIM"' }
        : undefined,
    status,
  });
}

function bearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) {
    throw createServiceError(HektorErrorCode.Unauthorized, {
      message: 'A SCIM bearer token is required',
    });
  }
  return match[1];
}

export async function withScim(
  request: Request,
  handler: (options: {
    baseUrl: string;
    context: { organisationId: string };
    service: ReturnType<typeof createScimService>;
  }) => Promise<Response>,
) {
  try {
    const service = createScimService(createAdminSupabaseClient());
    const context = await service.authenticate(bearerToken(request));
    const url = new URL(request.url);
    return await handler({
      baseUrl: `${url.origin}/api/scim/v2`,
      context,
      service,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return scimResponse(
        {
          detail: error.issues.map((issue) => issue.message).join('; '),
          schemas: [SCIM_ERROR_SCHEMA],
          scimType: 'invalidValue',
          status: '400',
        } satisfies ScimError,
        { status: 400 },
      );
    }
    return scimErrorResponse(error);
  }
}
