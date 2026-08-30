import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

import { createClient } from '@supabase/supabase-js';

import type { Database } from '@hektor/types/database';

interface LocalSupabaseStatus {
  ANON_KEY: string;
  API_URL: string;
  SERVICE_ROLE_KEY: string;
}

let cachedLocalSupabaseStatus: LocalSupabaseStatus | undefined;

function localSupabaseStatus(): LocalSupabaseStatus {
  if (cachedLocalSupabaseStatus) return cachedLocalSupabaseStatus;

  const repositoryRoot = resolve(process.cwd(), '../..');
  const output = execFileSync(
    'yarn',
    ['supabase', 'status', '--output', 'json'],
    {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    },
  );

  cachedLocalSupabaseStatus = JSON.parse(output) as LocalSupabaseStatus;
  return cachedLocalSupabaseStatus;
}

export function createIntegrationDatabaseClient() {
  const status = localSupabaseStatus();

  return createClient<Database>(status.API_URL, status.SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createIntegrationAuthClient() {
  const status = localSupabaseStatus();

  return createClient<Database>(status.API_URL, status.ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
