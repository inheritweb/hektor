import type { User } from '@supabase/supabase-js';
import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { googleIdentityConfig } from '@hektor/config/identity';

import { env } from '../../env';
import { createAdminClient } from '../supabase/admin';
import { createClient } from '../supabase/server';
import {
  canBootstrapPlatformAdmin,
  isPlatformAdmin,
  platformAdminEmails,
} from './platform-admin-policy';

export async function bootstrapPlatformAdmin(user: User) {
  if (isPlatformAdmin(user)) return user;

  if (
    !canBootstrapPlatformAdmin(
      user,
      platformAdminEmails(env.HEKTOR_ADMIN_EMAILS),
    )
  ) {
    return null;
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      role: googleIdentityConfig.platformAdminRole,
    },
  });

  if (error) throw error;

  return data.user;
}

export async function requirePlatformAdmin() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user || !isPlatformAdmin(user)) {
    redirect(googleIdentityConfig.loginPath as Route);
  }

  return user;
}

export async function requireAuthenticated() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) redirect(googleIdentityConfig.loginPath as Route);

  return user;
}
