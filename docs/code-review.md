# Reviewing Hektor changes

Review through GitHub PRs. Keep PRs focused and draft until ready; draft PRs run
CI but do not deploy previews. Require human review and passing CI before merging;
this change does not configure GitHub branch-protection enforcement.

## Review output

- 🔴 Must fix: demonstrated correctness, security or data-integrity failure.
- 🟠 Discuss: meaningful pattern, modelling, responsibility or DRY concern.
- 🟢 No action: no actionable finding within scope, with verification limits noted.

Keep inline comments to concrete red/amber issues and group repeated causes.
Use a short summary rather than per-file green comments. Balance cohesive modules
against both unnecessary extraction and modules with unrelated responsibilities.
Source-code comments should be sparse, explaining non-obvious intent rather than
restating the implementation.

## Copilot configuration

- `.github/copilot-instructions.md` defines priorities and reporting conventions.
- `.github/instructions/domain-contracts.instructions.md` focuses domain types,
  contracts, services, API routes and migrations on ownership and consistency.
- `.github/workflows/copilot-code-review.yml` supplies Node 24, Corepack and the
  pinned Yarn dependencies. It verifies typechecking and fast tests in the types
  package. Its PR check tests the setup; it does not itself request a review.

The setup copies the committed example to an absent root `.env`; it does not
provision credentials or start Supabase. Database/browser tests still run in the
existing CI jobs. Blank example credentials are not sufficient for every build
or authenticated test: use CI evidence or report the limitation. Do not use
hosted services to make review tests pass.

For an existing PR, bring the approved instruction changes into its head branch
before requesting a fresh review. Confirm the session log lists the instruction
files and successful setup steps. GitHub documents setup activation through the
default branch; a successful standalone setup check alone does not prove a review
session has used it. Check the session after this PR is merged.

Start with Balanced effort; choose Max for especially consequential changes when
its additional cost is justified. Do not increase effort just to force findings.
Reconcile review claims with the latest CI results for the reviewed commit.

## Diagnose restricted review context

Check the review session for blocked GitHub API requests and skipped/failed setup
steps. If a necessary API request is blocked, inspect the repository's Copilot
code-review Internet access settings and inherited organisation policy. Consider
a narrow allowlist entry for the required host; do not disable the firewall.
This PR does not change hosted firewall settings, review effort or approval rules.

References:

- [GitHub code review instructions, effort and environment](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-code-review)
- [GitHub setup workflow requirements](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)
