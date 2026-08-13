# Deployment runbook

Deployments are built and authorized by GitHub Actions. Vercel receives the
prebuilt output and hosts it, but its Git integration does not initiate builds.

## Release architecture

```text
pull request ──► GitHub validation ──► Vercel preview

main branch ───► GitHub validation ──► Vercel production
                       │
                       └── builds .vercel/output in GitHub Actions
```

The policy is split across:

- `.github/workflows/ci.yml` for independent continuous integration.
- `.github/workflows/deploy.yml` for validated preview and production releases.
- `vercel.json` for framework, install, build, output, and Git-deployment
  settings.

`git.deploymentEnabled` is `false`, preventing Vercel from creating a second,
uncontrolled deployment for the same Git event.

## Prerequisites

You need:

- Permission to create or link a Vercel project.
- Permission to manage GitHub repository environments and secrets.
- A hosted Supabase project, or another deployed API compatible with the web
  application's environment contract.
- An authenticated GitHub CLI if using the command examples below.

Local development does not require any of these cloud resources.

## 1. Create or link the Vercel project

Authenticate and link from the repository root:

```sh
yarn vercel login
yarn vercel:link
```

The CLI reads `vercel.json`, creates or selects a project, and writes the link
to the ignored `.vercel/project.json`. Inspect that file for `orgId` and
`projectId`.

Do not commit `.vercel`. GitHub receives the IDs through secrets instead.

## 2. Create a Vercel access token

Create a token in the Vercel account or team that owns the project. Give it the
smallest scope that can build and deploy this project. Store the token only in
GitHub; do not add it to `.env`.

The deployment workflow requires:

| Secret              | Value                                   |
| ------------------- | --------------------------------------- |
| `VERCEL_TOKEN`      | Vercel access token                     |
| `VERCEL_ORG_ID`     | `orgId` from `.vercel/project.json`     |
| `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

## 3. Configure GitHub environments

Create GitHub environments named `preview` and `production`. Add all three
Vercel secrets to each environment.

With GitHub CLI:

```sh
gh secret set VERCEL_TOKEN --env preview
gh secret set VERCEL_ORG_ID --env preview
gh secret set VERCEL_PROJECT_ID --env preview

gh secret set VERCEL_TOKEN --env production
gh secret set VERCEL_ORG_ID --env production
gh secret set VERCEL_PROJECT_ID --env production
```

For `production`, enable required reviewers and restrict deployment branches to
`main`. GitHub then remains the approval boundary even if a Vercel credential
is compromised elsewhere.

Do not expose environment secrets to workflows from forked pull requests. The
provided workflow explicitly skips their preview deployment job.

## 4. Configure runtime values in Vercel

The repository uses raw, unprefixed names as the source of truth:

```text
API_URL
SUPABASE_ANON_KEY
```

Set both in Vercel's Preview and Production environments. They are expanded
through the committed `apps/web/.env` mappings during the build:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=${API_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

The values can be added with the pinned CLI:

```sh
yarn vercel env add API_URL preview
yarn vercel env add SUPABASE_ANON_KEY preview
yarn vercel env add API_URL production
yarn vercel env add SUPABASE_ANON_KEY production
```

These variables are intentionally browser-visible. Never use a Supabase
service-role key here. Authorization must be enforced with Row Level Security,
not by treating the public client key as a secret.

## 5. Validate the Vercel build locally

Pull the selected Vercel environment and build the Build Output API artifact:

```sh
yarn vercel:pull --environment=preview
yarn vercel:build
```

For the production configuration:

```sh
yarn vercel:pull --environment=production
yarn vercel:build:production
```

The generated `.vercel` directory is ignored. A local Vercel build is an
additional deployment-specific check; it does not replace `yarn ci` or the
Playwright suite.

## Automatic releases

### Preview

A pull request whose branch belongs to this repository triggers the `preview`
job. It:

1. Installs dependencies immutably.
2. Runs formatting, linting, typechecking, and unit tests.
3. Pulls Preview environment configuration from Vercel.
4. Builds `.vercel/output` inside the GitHub runner.
5. Uploads the prebuilt output as a Vercel preview deployment.

Fork pull requests still run CI, but do not deploy because they cannot safely
receive deployment credentials.

### Production

A push to `main` triggers the `production` job. It follows the same validation
path, pulls Production configuration, builds with `--prod`, and deploys the
prebuilt artifact with `--prod`.

If the GitHub `production` environment requires approval, the job pauses before
it receives secrets or starts deployment.

## Manual releases

The Deploy workflow supports `workflow_dispatch` with a `preview` or
`production` target. In GitHub, open **Actions → Deploy → Run workflow**, select
the Git ref and target, then run it.

With GitHub CLI:

```sh
gh workflow run deploy.yml --ref <branch-or-tag> -f deployment=preview
gh workflow run deploy.yml --ref main -f deployment=production
```

Manual production runs use the same protected GitHub environment and validation
steps as automatic releases.

## Local CLI deployments

The root scripts expose the same low-level sequence for diagnostics:

```sh
# Preview
yarn vercel:pull --environment=preview
yarn vercel:build
yarn vercel:deploy:preview

# Production
yarn vercel:pull --environment=production
yarn vercel:build:production
yarn vercel:deploy:production
```

These commands mutate external deployment state. Prefer the GitHub workflow for
normal releases so validation, approval, and audit history stay centralized.

## Rollback

Prefer a forward rollback through Git:

1. Revert the faulty commit on `main`.
2. Merge or push the revert.
3. Let the standard production workflow build and deploy the known code state.

For an urgent rollback without a new commit, manually run the Deploy workflow
against a known-good tag (or a temporary branch at the known-good commit) and
choose `production`. This still preserves GitHub validation, environment
approval, and an Actions audit trail.

After rollback, verify authentication, critical routes, and database
compatibility. Deploying older application code does not reverse Supabase
migrations; database changes need an explicit forward migration when rollback
compatibility is required.

## Database releases

The current deployment workflow builds the web application; it does not push
Supabase migrations to a hosted project. This is deliberate until a migration
promotion policy is chosen.

When hosted database delivery is added, use a separate protected workflow and
environment. It should lint migrations, test them against a disposable database,
require production approval, and run `supabase db push` before deploying code
that depends on the new schema. Never reuse the local database reset command
against a hosted project.

## Troubleshooting

### The workflow cannot find the Vercel project

Check that `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` exactly match the linked
`.vercel/project.json`, and that they exist in the GitHub environment selected
by the job.

### Vercel authentication fails

Create a fresh token in the correct account or team, replace `VERCEL_TOKEN` in
both GitHub environments, and rerun the failed job. Do not print the token or
pass it through workflow outputs.

### The build reports missing Supabase variables

Confirm `API_URL` and `SUPABASE_ANON_KEY` exist in the Vercel environment being
pulled. The `NEXT_PUBLIC_` names are mappings and should not be the raw source
values.

### Vercel creates duplicate deployments

Confirm the deployed project reads the repository-root `vercel.json` and that
`git.deploymentEnabled` remains `false`. Also check that no deploy hook or
second workflow targets the same project.

### A preview is not created for a fork

This is expected. Fork workflows do not receive repository environment secrets.
Run the branch in a trusted repository context before deploying it.
