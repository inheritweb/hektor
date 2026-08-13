#!/usr/bin/env bash
set -euo pipefail

echo "==> Starting local Supabase"
yarn supabase:start

echo "==> Writing local Supabase web environment"
status_env="$(yarn --silent supabase status -o env)"
api_url="$(sed -n 's/^API_URL="\{0,1\}\([^"[:space:]]*\)"\{0,1\}$/\1/p' <<<"${status_env}")"
anon_key="$(sed -n 's/^ANON_KEY="\{0,1\}\([^"[:space:]]*\)"\{0,1\}$/\1/p' <<<"${status_env}")"

if [ -z "${anon_key}" ]; then
  anon_key="$(sed -n 's/^PUBLISHABLE_KEY="\{0,1\}\([^"[:space:]]*\)"\{0,1\}$/\1/p' <<<"${status_env}")"
fi

if [ -z "${api_url}" ] || [ -z "${anon_key}" ]; then
  echo "Could not read local Supabase credentials; run 'yarn supabase:status'." >&2
  exit 1
fi

touch .env
grep -Ev '^(API_URL|SUPABASE_ANON_KEY)=' .env > .env.tmp || true
printf 'API_URL=%s\nSUPABASE_ANON_KEY=%s\n' "${api_url}" "${anon_key}" >> .env.tmp
mv .env.tmp .env
