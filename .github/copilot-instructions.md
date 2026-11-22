# Hektor code review

Follow `AGENTS.md` and inspect nearby implementations before judging a change.
Review the changed behaviour and its callers, not just isolated diff lines.

## Review priorities

- **Patterns:** reinforce established Hektor conventions. Cite the relevant
  implementation when flagging a departure; allow a justified improvement.
- **Data modelling:** check ownership, identity, lifecycle and relationship
  cardinality. Domain/API objects should expose useful related objects or
  summaries; persistence rows and mutation inputs may use IDs. Distinguish
  reusable definitions from individual learner state.
- **Security:** trace authentication, organisation membership and permissions to
  each read/write. Schema validation is not authorisation. Look for cross-tenant
  or cross-learner access, client-controlled identity, privileged browser values
  and accidental disclosure. Check database enforcement where relevant.
- **Separation of concerns:** route handlers handle HTTP/authentication, services
  handle domain operations, contracts validate boundaries, and UI renders and
  collects input. Follow the existing browser/server split and package direction.
- **DRY:** identify duplicated rules, schemas or behaviour that can drift. Reuse
  the canonical source when semantics match; similar syntax alone is not a reason
  to couple unrelated concepts. Do not flag generated duplication as handwritten.

## Module boundaries and comments

Prefer cohesive modules with a clear responsibility. Recommend extraction when
there is a distinct domain responsibility, different dependencies or repeated
behaviour with a concrete maintenance cost. Keep small single-use helpers local
unless there is a real boundary to protect. Flag modules accumulating unrelated
responsibilities; do not prescribe a new module for every helper or an arbitrary
file-size limit. Check UI changes against `COMPONENTS.md`.

Keep source-code comments sparse and purposeful: explain a non-obvious reason,
constraint or surprising behaviour. Do not narrate obvious code, add routine
JSDoc to every declaration, or suggest extra comments as a substitute for clear
names and cohesive functions. Preserve comments that capture important intent.

## Traffic lights

- 🔴 **Must fix:** a demonstrated correctness, security or data-integrity problem.
  Give the trigger and consequence, then the smallest useful remedy.
- 🟠 **Discuss:** a concrete modelling, pattern, responsibility or duplication
  concern. Explain the tradeoff and the decision needed; label uncertainty.
- 🟢 **No action:** no actionable finding within the reviewed scope. Use this
  only in the summary, not as per-file praise or a guarantee of correctness.

Post inline comments only for actionable red/amber findings. Group repeated
instances of the same cause. Explain findings sufficiently for a reviewer to
assess them; include a minimal example when useful. Do not manufacture findings
or repeat issues already reported. Avoid formatting nits covered by automation.
End with a brief red/amber count, validation evidence and any material limit.

Check CI results for the reviewed commit using available GitHub tools. Separate
checks you ran, checks confirmed in CI and checks not verified. Do not repeat a
stale PR-description warning when CI resolves it. If access is blocked, say so.
Use the narrowest relevant repository test command when needed to verify a
finding. No issues found does not replace CI or human approval. Do not flag
explicitly deferred features as missing implementation unless current behaviour
already depends on them.
