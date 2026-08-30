import { z } from 'zod';

import { createServiceError } from '@hektor/services';
import { HektorErrorCode } from '@hektor/types/contracts';

import {
  scimGroupInputSchema,
  scimResponse,
  withScim,
} from '@/lib/scim/route-handler';

const listQuerySchema = z.object({
  count: z.coerce.number().int().positive().max(100).default(100),
  filter: z.string().optional(),
  startIndex: z.coerce.number().int().positive().default(1),
});

function displayNameFilter(filter?: string) {
  if (!filter) return undefined;
  const match = filter.match(/^displayName\s+eq\s+"([^"]+)"$/i);
  if (!match?.[1])
    throw createServiceError(HektorErrorCode.BadRequest, {
      message: 'Only displayName eq filters are supported',
      data: { scimType: 'invalidFilter' },
    });
  return match[1].trim();
}

export function GET(request: Request) {
  return withScim(request, async ({ baseUrl, context, service }) => {
    const query = listQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return scimResponse(
      await service.listGroups(
        context,
        { ...query, displayName: displayNameFilter(query.filter) },
        baseUrl,
      ),
    );
  });
}

export function POST(request: Request) {
  return withScim(request, async ({ baseUrl, context, service }) => {
    const group = await service.synchronizeGroup(
      context,
      scimGroupInputSchema.parse(await request.json()),
      baseUrl,
    );
    return scimResponse(group, {
      headers: { location: group.meta.location },
      status: 201,
    });
  });
}
