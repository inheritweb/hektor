export interface EmailIdentityConfig {
  provider: 'email';
  codeLength: 6;
  codeExpirySeconds: 600;
}

export const emailIdentityConfig = {
  provider: 'email',
  codeLength: 6,
  codeExpirySeconds: 600,
} as const satisfies EmailIdentityConfig;
