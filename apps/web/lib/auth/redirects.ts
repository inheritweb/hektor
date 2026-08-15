import { googleIdentityConfig } from '@hektor/config/identity';

export function resolvePostLoginPath(value: string | null) {
  if (!value) return googleIdentityConfig.defaultAuthenticatedPath;

  return googleIdentityConfig.allowedPostLoginPaths.includes(
    value as (typeof googleIdentityConfig.allowedPostLoginPaths)[number],
  )
    ? value
    : googleIdentityConfig.defaultAuthenticatedPath;
}
