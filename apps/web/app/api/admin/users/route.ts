import { createUsersService } from '@hektor/services/users';
import { listUsersContract } from '@hektor/types/contracts/users';

import { registerEndpoint } from '@/lib/api/route-handler';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const GET = registerEndpoint(listUsersContract, async ({ query }) =>
  createUsersService(createAdminSupabaseClient()).listUsers(query),
);
