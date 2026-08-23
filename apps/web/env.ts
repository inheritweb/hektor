import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    PUBLIC_BASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    HEKTOR_ADMIN_EMAILS: z.string().min(1),
    SMTP_FROM: z.string().min(1).default('Hektor <no-reply@hektor.local>'),
    SMTP_HOST: z.string().min(1).default('127.0.0.1'),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(54325),
    SMTP_SECURE: z.stringbool().default(false),
    SMTP_USER: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: {
    PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    HEKTOR_ADMIN_EMAILS: process.env.HEKTOR_ADMIN_EMAILS,
    SMTP_FROM: process.env.SMTP_FROM,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  emptyStringAsUndefined: true,
});
