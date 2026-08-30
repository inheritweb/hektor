import { z } from 'zod';

import { createServiceError } from '@hektor/services';
import { HektorErrorCode } from '@hektor/types/contracts';

import {
  scimResponse,
  scimUserInputSchema,
  withScim,
} from '@/lib/scim/route-handler';

const listQuerySchema = z.object({
  count: z.coerce.number().int().positive().max(100).default(100),
  filter: z.string().optional(),
  startIndex: z.coerce.number().int().positive().default(1),
});

function userNameFilter(filter?: string) {
  if (!filter) return undefined;
  const match = filter.match(/^userName\s+eq\s+"([^"]+)"$/i);
  if (!match?.[1]) {
    throw createServiceError(HektorErrorCode.BadRequest, {
      message: 'Only userName eq filters are supported',
    });
  }
  return match[1].trim().toLocaleLowerCase();
}

export function GET(request: Request) {
  return withScim(request, async ({ baseUrl, context, service }) => {
    const url = new URL(request.url);
    const query = listQuerySchema.parse(Object.fromEntries(url.searchParams));
    return scimResponse(
      await service.listUsers(
        context,
        { ...query, userName: userNameFilter(query.filter) },
        baseUrl,
      ),
    );
  });
}

export function POST(request: Request) {
  return withScim(request, async ({ baseUrl, context, service }) => {
    const input = scimUserInputSchema.parse(await request.json());
    const user = await service.synchronizeUser(context, input, baseUrl);
    return scimResponse(user, {
      headers: { location: user.meta.location },
      status: 201,
    });
  });
}
