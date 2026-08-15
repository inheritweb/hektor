import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

import { createClient } from '@supabase/supabase-js';

import type { Database } from '@hektor/types/database';

interface LocalSupabaseStatus {
  API_URL: string;
  SERVICE_ROLE_KEY: string;
}

function localSupabaseStatus(): LocalSupabaseStatus {
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

  return JSON.parse(output) as LocalSupabaseStatus;
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
