export interface GoogleIdentityConfig {
  provider: 'google';
  callbackPath: `/${string}`;
  loginPath: `/${string}`;
  errorPath: `/${string}`;
  defaultAuthenticatedPath: `/${string}`;
  allowedPostLoginPaths: readonly `/${string}`[];
  platformAdminRole: 'admin';
}

export const googleIdentityConfig = {
  provider: 'google',
  callbackPath: '/auth/callback',
  loginPath: '/login',
  errorPath: '/login/error',
  defaultAuthenticatedPath: '/',
  allowedPostLoginPaths: ['/'],
  platformAdminRole: 'admin',
} as const satisfies GoogleIdentityConfig;
