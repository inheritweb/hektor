#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing Yarn workspace dependencies"
if [ -f yarn.lock ]; then
  yarn install --immutable
else
  yarn install
fi

echo "==> Supabase CLI: $(yarn supabase --version)"
echo "==> Vercel CLI: $(yarn vercel --version)"

echo "==> Installing Playwright Chromium browser"
yarn workspace @hektor/web playwright install --with-deps chromium

cat <<'EOF'

==========================================================
  Hektor dev container ready.
  Web:              http://localhost:3000
  Supabase API:     http://localhost:54321
  Supabase Studio:  http://localhost:54323
  Supabase Mailpit: http://localhost:54324
  Start all apps:   yarn dev
==========================================================
EOF
