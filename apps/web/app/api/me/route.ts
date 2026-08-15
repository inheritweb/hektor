import { getCurrentUser } from '@hektor/services/users';
import { getCurrentUserContract } from '@hektor/types/contracts/users';

import { registerEndpoint } from '../../../lib/api/route-handler';

export const GET = registerEndpoint(
  getCurrentUserContract,
  async (_, { supabase, user }) => getCurrentUser(supabase, user),
);
