import { getCurrentUser } from '@hektor/services/users';
import { HektorErrorCode } from '@hektor/types/contracts';
import { getCurrentUserContract } from '@hektor/types/contracts/users';
import { createServiceError } from '@hektor/services';

import { registerEndpoint } from '../../../lib/api/route-handler';
import { createClient } from '../../../lib/supabase/server';

export const GET = registerEndpoint(getCurrentUserContract, async () => {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    throw createServiceError(HektorErrorCode.Unauthorized, {
      message: 'You must be signed in',
      internalMessage: error?.message,
      cause: error,
    });
  }

  return getCurrentUser(client, user);
});
