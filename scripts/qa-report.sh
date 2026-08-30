#!/usr/bin/env bash

set -uo pipefail

repository_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repository_root"

mkdir -p artifacts
report_path="artifacts/qa-report-$(date -u +%Y%m%dT%H%M%SZ).log"
failures=0

exec > >(tee "$report_path") 2>&1

run_check() {
  local label=$1
  shift

  printf '\n===== %s =====\n' "$label"
  if "$@"; then
    printf 'RESULT: PASS — %s\n' "$label"
  else
    printf 'RESULT: FAIL — %s\n' "$label"
    failures=$((failures + 1))
  fi
}

printf 'Hektor QA report\n'
printf 'Started: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf 'Repository: %s\n' "$repository_root"

run_check 'Node version' node --version
run_check 'Yarn version' yarn --version
run_check 'Git status' git status --short
run_check 'Git diff whitespace check' git diff --check
run_check 'Immutable dependency install' yarn install --immutable
run_check 'Create local environment mapping when absent' bash -c 'test -f .env || cp .env.example .env'
run_check 'Fast checks (format, seed, lint, types)' yarn check
run_check 'Unit tests' yarn test
run_check 'Production build' yarn build
run_check 'Storybook build' yarn storybook:build
run_check 'Start local Supabase' yarn supabase:start
run_check 'Local Supabase status' yarn supabase:status
run_check 'Database integration tests' yarn test:integration
run_check 'Install Chromium for browser tests' yarn workspace @hektor/web playwright install --with-deps chromium
run_check 'Browser tests' yarn test:e2e

printf '\n===== SUMMARY =====\n'
printf 'Finished: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf 'Report: %s\n' "$report_path"
printf 'Failures: %s\n' "$failures"

if [ "$failures" -gt 0 ]; then
  exit 1
fi
