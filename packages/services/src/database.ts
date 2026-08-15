import type { Database } from '@hektor/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

export type DatabaseClient = SupabaseClient<Database>;
