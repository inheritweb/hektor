#!/usr/bin/env bash
set -euo pipefail

echo "==> Starting local Supabase"
yarn supabase:start >/dev/null

echo "==> Writing local Supabase web environment"
status_env="$(yarn supabase status -o env 2>/dev/null)"
api_url="$(sed -n 's/^API_URL="\{0,1\}\([^"[:space:]]*\)"\{0,1\}$/\1/p' <<<"${status_env}")"
anon_key="$(sed -n 's/^ANON_KEY="\{0,1\}\([^"[:space:]]*\)"\{0,1\}$/\1/p' <<<"${status_env}")"
service_role_key="$(sed -n 's/^SERVICE_ROLE_KEY="\{0,1\}\([^"[:space:]]*\)"\{0,1\}$/\1/p' <<<"${status_env}")"

if [ -z "${anon_key}" ]; then
  anon_key="$(sed -n 's/^PUBLISHABLE_KEY="\{0,1\}\([^"[:space:]]*\)"\{0,1\}$/\1/p' <<<"${status_env}")"
fi

if [ -z "${api_url}" ] || [ -z "${anon_key}" ] || [ -z "${service_role_key}" ]; then
  echo "Could not read local Supabase credentials; run 'yarn supabase:status'." >&2
  exit 1
fi

touch .env
grep -Ev '^(SUPABASE_URL|SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY)=' .env > .env.tmp || true
printf 'SUPABASE_URL=%s\nSUPABASE_ANON_KEY=%s\nSUPABASE_SERVICE_ROLE_KEY=%s\n' "${api_url}" "${anon_key}" "${service_role_key}" >> .env.tmp
mv .env.tmp .env
