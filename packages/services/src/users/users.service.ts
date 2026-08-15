import type { GetCurrentUserResponse } from '@hektor/types/contracts/users';
import { HektorErrorCode } from '@hektor/types/contracts';
import type { User } from '@supabase/supabase-js';

import { createServiceError } from '../errors';

import { mapCurrentUser } from './users.mappers';
import {
  buildCurrentUserOrganisationsQuery,
  type DatabaseClient,
} from './users.queries';

export async function getCurrentUser(
  client: DatabaseClient,
  user: User,
): Promise<GetCurrentUserResponse> {
  const { data, error } = await buildCurrentUserOrganisationsQuery(
    client,
    user.id,
  );

  if (error) {
    throw createServiceError(HektorErrorCode.InternalServerError, {
      message: 'Unable to load your account',
      internalMessage: error.message,
      cause: error,
    });
  }

  return { data: mapCurrentUser(user, data) };
}
