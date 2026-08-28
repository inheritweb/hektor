import { createUsersService } from '@hektor/services/users';
import {
  getUserContract,
  updateUserContract,
} from '@hektor/types/contracts/users';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(getUserContract, async ({ params }) =>
  createUsersService(createAdminSupabaseClient()).getUser(params),
);

export const PATCH = registerEndpoint(
  updateUserContract,
  async ({ body, params }, { user }) =>
    createUsersService(createAdminSupabaseClient()).updateUser(
      params,
      body,
      user.id,
    ),
);
