import type { EmailOtpType } from '@supabase/supabase-js';

import type { DatabaseClient } from '@hektor/services';

export async function establishEmailSession(
  adminClient: DatabaseClient,
  sessionClient: DatabaseClient,
  email: string,
) {
  let generated = await adminClient.auth.admin.generateLink({
    email,
    type: 'magiclink',
  });

  if (generated.error) {
    const created = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      password: crypto.randomUUID(),
    });

    if (created.error) throw created.error;
    generated = await adminClient.auth.admin.generateLink({
      email,
      type: 'magiclink',
    });
  }

  if (generated.error) throw generated.error;

  const properties = generated.data.properties;

  if (!properties?.hashed_token) throw new Error('session_token_not_generated');

  const verified = await sessionClient.auth.verifyOtp({
    token_hash: properties.hashed_token,
    type: properties.verification_type as EmailOtpType,
  });

  if (verified.error) throw verified.error;
}
