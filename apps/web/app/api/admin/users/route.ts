import { createUsersService } from '@hektor/services/users';
import {
  createUserContract,
  listUsersContract,
} from '@hektor/types/contracts/users';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(listUsersContract, async ({ query }) =>
  createUsersService(createAdminSupabaseClient()).listUsers(query),
);

export const POST = registerEndpoint(createUserContract, async ({ body }) =>
  createUsersService(createAdminSupabaseClient()).createUser(body),
);
