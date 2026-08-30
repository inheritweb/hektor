import { z } from 'zod';

import { createServiceError } from '@hektor/services';
import type { ScimUserInput } from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';

import {
  scimResponse,
  scimUserInputSchema,
  withScim,
} from '@/lib/scim/route-handler';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

const patchSchema = z.object({
  Operations: z.array(
    z.object({
      op: z.enum(['add', 'replace', 'remove']),
      path: z.string().optional(),
      value: z.unknown().optional(),
    }),
  ),
  schemas: z.array(z.string()),
});

export async function GET(request: Request, route: RouteContext) {
  const { userId } = await route.params;
  return withScim(request, async ({ baseUrl, context, service }) =>
    scimResponse(await service.getUser(context, userId, baseUrl)),
  );
}

export async function PUT(request: Request, route: RouteContext) {
  const { userId } = await route.params;
  return withScim(request, async ({ baseUrl, context, service }) => {
    const input = scimUserInputSchema.parse(await request.json());
    return scimResponse(
      await service.synchronizeUser(context, input, baseUrl, userId),
    );
  });
}

export async function PATCH(request: Request, route: RouteContext) {
  const { userId } = await route.params;
  return withScim(request, async ({ baseUrl, context, service }) => {
    const current = await service.getUser(context, userId, baseUrl);
    const patch = patchSchema.parse(await request.json());
    const input: ScimUserInput = {
      active: current.active,
      displayName: current.displayName,
      externalId: current.externalId,
      name: current.name,
      schemas: current.schemas,
      userName: current.userName,
    };
    for (const operation of patch.Operations) {
      applyPatch(input, operation);
    }
    return scimResponse(
      await service.synchronizeUser(context, input, baseUrl, userId),
    );
  });
}

export async function DELETE(request: Request, route: RouteContext) {
  const { userId } = await route.params;
  return withScim(request, async ({ baseUrl, context, service }) => {
    const current = await service.getUser(context, userId, baseUrl);
    await service.synchronizeUser(
      context,
      { ...current, active: false },
      baseUrl,
      userId,
    );
    return new Response(null, { status: 204 });
  });
}

function applyPatch(
  input: ScimUserInput,
  operation: z.infer<typeof patchSchema>['Operations'][number],
) {
  const path = operation.path?.toLocaleLowerCase();
  if (!path && operation.value && typeof operation.value === 'object') {
    Object.assign(input, operation.value);
    return;
  }
  if (path === 'active' && typeof operation.value === 'boolean') {
    input.active = operation.value;
    return;
  }
  if (path === 'username' && typeof operation.value === 'string') {
    input.userName = operation.value;
    return;
  }
  if (path === 'displayname' && typeof operation.value === 'string') {
    input.displayName = operation.value;
    return;
  }
  if (
    (path === 'name.givenname' || path === 'name.familyname') &&
    typeof operation.value === 'string'
  ) {
    input.name ??= {};
    if (path === 'name.givenname') input.name.givenName = operation.value;
    else input.name.familyName = operation.value;
    return;
  }
  throw createServiceError(HektorErrorCode.BadRequest, {
    message: `Unsupported SCIM patch path: ${operation.path ?? '(none)'}`,
  });
}
