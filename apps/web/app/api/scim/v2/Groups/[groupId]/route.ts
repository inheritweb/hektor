import { z } from 'zod';

import { createServiceError } from '@hektor/services';
import type { ScimGroupInput, ScimGroupMember } from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';

import {
  scimGroupInputSchema,
  scimResponse,
  withScim,
} from '@/lib/scim/route-handler';

interface RouteContext {
  params: Promise<{ groupId: string }>;
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
  const { groupId } = await route.params;
  return withScim(request, async ({ baseUrl, context, service }) =>
    scimResponse(await service.getGroup(context, groupId, baseUrl)),
  );
}

export async function PUT(request: Request, route: RouteContext) {
  const { groupId } = await route.params;
  return withScim(request, async ({ baseUrl, context, service }) =>
    scimResponse(
      await service.synchronizeGroup(
        context,
        scimGroupInputSchema.parse(await request.json()),
        baseUrl,
        groupId,
      ),
    ),
  );
}

export async function PATCH(request: Request, route: RouteContext) {
  const { groupId } = await route.params;
  return withScim(request, async ({ baseUrl, context, service }) => {
    const current = await service.getGroup(context, groupId, baseUrl);
    const input: ScimGroupInput = {
      displayName: current.displayName,
      externalId: current.externalId,
      members: current.members,
      schemas: current.schemas,
    };
    for (const operation of patchSchema.parse(await request.json()).Operations)
      applyPatch(input, operation);
    return scimResponse(
      await service.synchronizeGroup(context, input, baseUrl, groupId),
    );
  });
}

export async function DELETE(request: Request, route: RouteContext) {
  const { groupId } = await route.params;
  return withScim(request, async ({ context, service }) => {
    await service.deleteGroup(context, groupId);
    return new Response(null, { status: 204 });
  });
}

function applyPatch(
  input: ScimGroupInput,
  operation: z.infer<typeof patchSchema>['Operations'][number],
) {
  const path = operation.path?.toLocaleLowerCase();
  if (path === 'displayname' && typeof operation.value === 'string') {
    input.displayName = operation.value;
    return;
  }
  if (path === 'members' || !path) {
    const members = memberValues(operation.value);
    if (operation.op === 'remove') {
      const removed = new Set(members.map(({ value }) => value));
      input.members = removed.size
        ? input.members?.filter(({ value }) => !removed.has(value))
        : [];
    } else if (operation.op === 'replace') input.members = members;
    else {
      const combined = [...(input.members ?? []), ...members];
      input.members = [
        ...new Map(combined.map((item) => [item.value, item])).values(),
      ];
    }
    return;
  }
  const filteredMember = path?.match(/^members\[value eq "([^"]+)"\]$/)?.[1];
  if (operation.op === 'remove' && filteredMember) {
    input.members = input.members?.filter(
      ({ value }) => value !== filteredMember,
    );
    return;
  }
  throw createServiceError(HektorErrorCode.BadRequest, {
    message: `Unsupported SCIM group patch path: ${operation.path ?? '(none)'}`,
  });
}

function memberValues(value: unknown): ScimGroupMember[] {
  const candidate =
    value && typeof value === 'object' && 'members' in value
      ? (value as { members: unknown }).members
      : value;
  return z
    .array(
      z.object({
        display: z.string().optional(),
        type: z.literal('User').optional(),
        value: z.uuid(),
      }),
    )
    .default([])
    .parse(candidate);
}
