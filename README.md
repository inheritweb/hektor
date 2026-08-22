# Hektor

This repository is a local-first TypeScript monorepo. This document describes
the development environment, repository conventions, and delivery tooling; it
intentionally makes no assumptions about the product itself.

## Toolchain

| Tool                | Purpose                                                 |
| ------------------- | ------------------------------------------------------- |
| Node.js 24 LTS      | JavaScript runtime used locally and in CI               |
| Yarn 4 via Corepack | Reproducible package and workspace management           |
| Turborepo           | Task orchestration and caching across workspaces        |
| Next.js 16          | Web application framework                               |
| React 19            | Web UI runtime                                          |
| TypeScript 6        | Static type checking                                    |
| Tailwind CSS 4      | CSS-first utility styling                               |
| Supabase            | Local Postgres, Auth, API, Storage, Studio, and Mailpit |
| Vitest              | Unit tests                                              |
| Playwright          | Browser-level end-to-end tests                          |
| ESLint and Prettier | Code quality and formatting                             |
| Vercel CLI          | Reproducible builds and deployments from GitHub Actions |
| GitHub CLI          | Repository operations from inside the dev container     |

Exact versions are pinned in the workspace manifests and `yarn.lock`.

## Repository layout

```text
.
├── .devcontainer/            # Reproducible Node/Docker development environment
├── .github/workflows/        # CI and GitHub-controlled deployment
├── apps/
│   └── web/                  # Next.js application
├── packages/
│   ├── eslint-config/        # Shared flat ESLint configuration
│   ├── tailwind-config/      # Shared Tailwind theme and design tokens
│   ├── types/                # Shared application and generated database types
│   ├── typescript-config/    # Shared strict TypeScript configuration
│   └── ui/                   # Atomic component library and Storybook
├── supabase/
│   ├── migrations/           # Version-controlled database schema
│   └── config.toml           # Local Supabase configuration
├── package.json              # Workspace scripts and pinned CLIs
├── turbo.json                # Task graph and cache inputs
└── vercel.json               # Version-controlled Vercel build policy
```

## Getting started

### Requirements

Install a Dev Container-compatible editor or CLI and ensure the host has a
Docker-compatible runtime. The host does not need Node, Yarn, Supabase CLI,
Vercel CLI, PostgreSQL, or Playwright.

The container declares a minimum of 2 CPUs, 8 GB of memory, and 16 GB of
storage. This provides enough headroom for Yarn, the complete local Supabase
stack, Next.js, and Playwright to run together. The first start takes longer
because it downloads the Supabase service images and Playwright's Chromium
browser.

### Open the dev container

Clone the repository and choose **Reopen in Container** in VS Code or another
Dev Container-compatible editor.

On creation, the container:

1. Installs Node.js 24 LTS and enables the repository-pinned Yarn through Corepack.
2. Installs workspace dependencies from `yarn.lock`.
3. Provides an isolated Docker engine for the local Supabase stack.
4. Installs Chromium and its system dependencies for Playwright.
5. Installs the GitHub CLI as `gh`.

On every start, it launches Supabase and updates the local Supabase values in
the ignored root `.env`. Existing unrelated variables in that file are
preserved.

Start the product application and its development simulator:

```sh
yarn dev:app
```

The main local services are:

| Service         | Address                                                   |
| --------------- | --------------------------------------------------------- |
| Web application | http://localhost:3000                                     |
| Simulator       | http://localhost:3001                                     |
| Supabase API    | http://localhost:54321                                    |
| PostgreSQL      | `postgresql://postgres:postgres@localhost:54322/postgres` |
| Supabase Studio | http://localhost:54323                                    |
| Mailpit         | http://localhost:54324                                    |

These ports are forwarded by the dev container, so they are available in a
browser or database client on the host.

## Yarn and workspaces

Yarn is selected through the `packageManager` field in the root `package.json`.
Corepack downloads that exact release, preventing developers and CI from using
different package-manager versions.

The project uses Yarn's `node-modules` linker for broad compatibility with
Next.js, Vercel, editors, and third-party tools. Always run commands from the
repository root unless a section says otherwise.

Common dependency operations:

```sh
# Install exactly what is in the lockfile
yarn install --immutable

# Add an application dependency
yarn workspace @hektor/web add <package>

# Add a development dependency
yarn workspace @hektor/web add --dev <package>
```

Commit `yarn.lock` whenever dependencies change.

## Root command reference

Turborepo discovers scripts in each workspace and runs the applicable tasks in
dependency order. It caches successful work when the declared inputs have not
changed.

### Development and validation

| Command                | What it does                                 |
| ---------------------- | -------------------------------------------- |
| `yarn dev`             | Runs all persistent development tasks        |
| `yarn dev:app`         | Runs the web app and development simulator   |
| `yarn dev:web`         | Runs only the web application                |
| `yarn build`           | Creates all production builds                |
| `yarn ci`              | Runs checks, tests, app and Storybook builds |
| `yarn lint`            | Runs ESLint across participating workspaces  |
| `yarn lint:fix`        | Runs ESLint and applies safe fixes           |
| `yarn typecheck`       | Runs TypeScript without emitting files       |
| `yarn format`          | Formats the repository with Prettier         |
| `yarn format:check`    | Checks formatting without changing files     |
| `yarn check`           | Runs formatting, linting, and typechecking   |
| `yarn test`            | Runs unit tests once through Turborepo       |
| `yarn test:watch`      | Runs web unit tests interactively            |
| `yarn test:e2e`        | Runs the Playwright browser suite            |
| `yarn test:e2e:ui`     | Opens Playwright's interactive test UI       |
| `yarn storybook`       | Runs the UI library's Storybook              |
| `yarn storybook:build` | Builds the static Storybook                  |

Component structure and dependency rules are defined in `COMPONENTS.md`.
Shared semantic design tokens live in `@hektor/tailwind-config`; applications
may override its CSS custom properties. Reusable components live in `@hektor/ui`
and are reviewed through Storybook.

### Supabase

| Command                              | What it does                                       |
| ------------------------------------ | -------------------------------------------------- |
| `yarn supabase --help`               | Opens the pinned Supabase CLI                      |
| `yarn supabase:start`                | Starts the local stack                             |
| `yarn supabase:stop`                 | Stops the local stack without resetting data       |
| `yarn supabase:status`               | Displays local endpoints and credentials           |
| `yarn supabase:lint`                 | Lints the local database schema                    |
| `yarn supabase:migration:new <name>` | Creates a timestamped migration                    |
| `yarn supabase:reset`                | Rebuilds local data from migrations and seed files |
| `yarn supabase:types`                | Regenerates shared local database types            |

### Vercel

| Command                         | What it does                                  |
| ------------------------------- | --------------------------------------------- |
| `yarn vercel --help`            | Opens the pinned Vercel CLI                   |
| `yarn vercel:link`              | Creates or links the Vercel project           |
| `yarn vercel:pull`              | Pulls linked project settings and environment |
| `yarn vercel:dev`               | Runs the Vercel development runtime           |
| `yarn vercel:build`             | Builds preview output locally                 |
| `yarn vercel:build:production`  | Builds production output locally              |
| `yarn vercel:deploy:preview`    | Deploys existing prebuilt preview output      |
| `yarn vercel:deploy:production` | Deploys existing prebuilt production output   |

Before opening a pull request, run:

```sh
yarn check
yarn test
yarn build
yarn test:e2e
```

## Environment variables

Raw values have one source locally: the ignored `.env` at the repository root.
Start from the committed template when not using the dev-container startup:

```sh
cp .env.example .env
```

Application-level `.env` files are committed, contain no raw values, and only
map root names to framework-specific names. For example:

```dotenv
# Root .env — ignored, raw values
API_URL=http://localhost:54321
SUPABASE_ANON_KEY=...

# apps/web/.env — committed, mappings only
NEXT_PUBLIC_SUPABASE_URL=${API_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

The web scripts use `dotenv-cli` to load the root file before Next.js expands
the mappings in `apps/web/.env`. New apps should follow the same convention:

1. Put each raw value in the root `.env` and `.env.example`.
2. Add only the app's required prefix or alias in its committed `.env`.
3. Load the root file before starting the app.
4. Add validated application-facing variables to the app's environment schema.

Never commit the root `.env`, credentials, tokens, or raw values in an app's
mapping file. Variables prefixed with `NEXT_PUBLIC_` are included in browser
bundles and must never contain privileged secrets.

## Web application

`apps/web` uses the Next.js App Router, strict TypeScript, React, and Tailwind
CSS v4. Supabase clients are separated by runtime:

- `lib/supabase/client.ts` creates a browser client.
- `lib/supabase/server.ts` creates a cookie-aware server client.
- `lib/supabase/proxy.ts` and `proxy.ts` refresh authentication sessions.
- `env.ts` validates public environment variables at runtime.

Tailwind uses its v4 CSS-first PostCSS integration. Global CSS begins with:

```css
@import 'tailwindcss';
```

Theme tokens can be declared with `@theme` in `apps/web/app/styles.css`. A
legacy `tailwind.config.js` is not required for the current setup.

## Local Supabase

Supabase runs its complete local stack inside the dev container's isolated
Docker engine. The CLI is pinned as a project dependency; invoke it through
Yarn so everyone uses the same version:

```sh
yarn supabase status
yarn supabase:start
yarn supabase:stop
```

Supabase Studio provides a local graphical interface at
http://localhost:54323. Mailpit captures local authentication email at
http://localhost:54324.

### Database workflow

Database structure belongs in `supabase/migrations`, not in untracked Studio
changes. The normal workflow is:

```sh
# Create a new migration file
yarn supabase migration new <migration_name>

# Recreate the local database from all migrations and seed data
yarn supabase:reset

# Regenerate shared TypeScript database types
yarn supabase:types
```

Generated types are written to `packages/types/src/database.ts` and should be
committed alongside the migration. The initial migration provides an
auth-linked `profiles` table, row-level security policies, and automatic
timestamps.

`yarn supabase:reset` destroys local database data by design. It does not target
a linked hosted project unless explicitly given linked-project flags.

## Testing

### Unit tests

Vitest runs files matching the unit-test conventions while excluding
`tests/e2e`:

```sh
yarn test
```

### Browser tests

Playwright starts the web application, runs tests in Chromium, and shuts the
server down afterward:

```sh
yarn test:e2e
```

Browser tests live in `apps/web/tests/e2e`. Reports and test artifacts are
ignored locally and uploaded by CI when appropriate.

## Command-line tooling

The main project tools are pinned dependencies rather than mutable global
installs:

```sh
yarn supabase --help
yarn vercel --help
```

The GitHub CLI is provided by the dev container:

```sh
gh auth login
gh auth status
```

Authentication state and tokens remain outside version control.

## Continuous integration

`.github/workflows/ci.yml` runs for pull requests and pushes to `main`. It uses
Node 24 LTS and the pinned Corepack/Yarn versions, then performs:

1. Immutable dependency installation.
2. Formatting, linting, and typechecking.
3. Unit tests.
4. A production Next.js build.
5. Playwright tests in a separate browser job.

The workflow uses non-secret local placeholders for the Supabase variables; it
does not need a hosted Supabase project.

## GitHub-controlled Vercel deployment

Vercel does not deploy directly from Git pushes. The repository's
`vercel.json` sets `git.deploymentEnabled` to `false`, and
`.github/workflows/deploy.yml` owns the release process:

- Pull requests from branches in this repository create preview deployments.
- Pushes to `main` create production deployments.
- Forked pull requests do not receive deployment secrets or deploy previews.
- Validation runs before either deployment.
- GitHub Actions runs `vercel build` and uploads only `.vercel/output` with
  `vercel deploy --prebuilt`.

This keeps build and release policy reviewable in the repository rather than
spread across dashboard settings.

### One-time Vercel bootstrap

Cloud deployment is optional and is not required for local development. When
it is needed:

1. Authenticate locally with `yarn vercel login`.
2. Run `yarn vercel link` once from the repository root.
3. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as secrets in
   the GitHub `preview` and `production` environments.
4. Add raw `API_URL` and `SUPABASE_ANON_KEY` values to the corresponding Vercel
   environments. The committed web mapping supplies the `NEXT_PUBLIC_` names.
5. Protect the GitHub `production` environment with any required reviewers or
   branch rules.

Build, install, output-directory, framework, and automatic-Git-deployment
settings are defined in `vercel.json`.

See the complete [deployment runbook](docs/deployment.md) for setup, secrets,
manual releases, rollback, database-release boundaries, and troubleshooting.

## Adding another app

1. Create `apps/<name>/package.json` with a unique `@hektor/<name>` workspace
   name.
2. Extend the shared TypeScript and ESLint packages.
3. Add scripts named `dev`, `build`, `lint`, `typecheck`, and `test` where they
   apply; Turborepo will discover them automatically.
4. Add a committed mapping-only `apps/<name>/.env` if environment variables are
   needed.
5. Keep its raw values in the root `.env` and document them in `.env.example`.
6. Add targeted CI or deployment behavior only when it differs from the
   existing task graph.

## Troubleshooting

### The web app reports missing environment variables

Confirm the root `.env` exists and contains non-empty `API_URL` and
`SUPABASE_ANON_KEY` values. Inside the dev container, restart Supabase or reopen
the container to regenerate its local values.

### Supabase is not available

Check the local stack:

```sh
yarn supabase:status
```

If required, restart it:

```sh
yarn supabase:stop
yarn supabase:start
```

The first start downloads several container images and can take a few minutes.

### Yarn uses the wrong version

Run `corepack enable`, then confirm `yarn --version` matches the version in the
root `package.json`. Do not install Yarn globally with npm.

### Playwright cannot find Chromium

Inside the dev container, run:

```sh
yarn workspace @hektor/web playwright install --with-deps chromium
```

### A task appears stale

Force Turborepo to bypass its cache:

```sh
yarn turbo run <task> --force
```
