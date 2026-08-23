import nodemailer from 'nodemailer';

import type { MessageSender } from './message-sender';

export interface SmtpMessageSenderOptions {
  from: string;
  host: string;
  password?: string;
  port: number;
  secure?: boolean;
  user?: string;
}

export function createSmtpMessageSender(
  options: SmtpMessageSenderOptions,
): MessageSender {
  const transport = nodemailer.createTransport({
    host: options.host,
    port: options.port,
    secure: options.secure ?? false,
    ...(options.user
      ? { auth: { user: options.user, pass: options.password ?? '' } }
      : {}),
  });

  return {
    async send(message) {
      await transport.sendMail({ ...message, from: options.from });
    },
  };
}
