import { createSmtpMessageSender } from '@hektor/messaging';

import { env } from '@/env';

export function createMessageSender() {
  return createSmtpMessageSender({
    from: env.SMTP_FROM,
    host: env.SMTP_HOST,
    password: env.SMTP_PASSWORD,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
  });
}
