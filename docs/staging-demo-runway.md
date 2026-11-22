# Staging demo runway

Status: slice 1 merged in PR #3. On 22 November 2026 the user authorised the
next step. Slice 2 is being split into small reviewable PRs, beginning with
assignment and snapshot boundaries (2a). Persistence and authenticated APIs
remain outstanding; later product slices still require approval. This plan
builds on [learning-experiences-design.md](learning-experiences-design.md).

## Release story

A tutor signs into a prepared demo organisation, previews a curated Learning
Experience containing two scenarios and assigns it to an available group. A
learner opens the experience, explores Esther's stroke scenario, creates her
care plan and writes a response about the second scenario. After signing out
and returning, the work is intact and the care plan appears in Esther's EHR
within that learner's experience. The tutor can inspect the learner's work.
Another learner's work and another organisation's records remain private.

Staging is useful when this story works without developer intervention. Passing
a production build alone is not the release gate.

## Scope and working choices

Agreed: experiences own activities; activities can reference multiple scenarios;
writing is external to the EHR; care plans are clinical documents that persist
within an individual's experience. Domain relationships expose useful objects or
summaries. Assessment and shared group work are deferred.

Working choices for the first demo, to be verified in their implementation slice:

- Seed one curated experience, two scenarios, one writing activity and one
  care-plan activity. Use Esther's existing progression; select and verify the
  second case before adding its clinical content.
- Use immediate assignment with no scheduled release or deadline controls.
  Capture recipients at assignment time. Later group changes do not silently
  enrol or remove learners from that assignment.
- Preserve an immutable copy of the experience and resolved source scenario
  definitions at assignment. Source edits must not alter existing learner work.
- One learner participation per assignment and organisation membership. The same
  experience can be assigned again without sharing responses between assignments.
- Save draft work with optimistic concurrency. Do not introduce submission,
  marking, feedback or completion scores into this milestone.
- A care plan starts with a title, identified need, goals, interventions and an
  optional evaluation, consistent with the existing clinical content vocabulary.
  Saving partially completed work must be possible.
  Its patient context is fixed when created; later edits must not silently move
  an existing clinical document to another patient.
- Organisation administrators control tutor/group access. Implement explicit
  access checks; do not give every tutor access to every group by default.
- Use prepared demo users with supported sign-in flows. Institutional SSO,
  arbitrary authoring, branching progression and a general form builder are not
  required to demonstrate the first loop.

These defaults are implementation choices for the runway, not claims that the
previous discussion settled every delivery or permissions question.

## Ordered slices

### 1. Content and learner-work boundaries — implemented

- Finish activity, scenario-reference and care-plan domain types.
- Add runtime schemas derived from those types and existing enums.
- Validate experience ownership, unique ordering and scenario references.
- Validate learner-work context without mistaking schema validation for access
  control. Keep database IDs in mutation inputs where useful.
- Add regression coverage for mixed scenarios, mismatched activity types,
  cross-learner references and partially completed writing/care plans.

Exit: meaningful validation tests, `yarn check`, relevant unit tests and a
production build pass. No new endpoint is advertised before it is implemented.

### 2. Individual persistence and API

Implement in small PRs:

- **2a — assignment boundaries (current):** canonical assignment and snapshot
  types, strict boundary schemas and individual participation's assignment
  relationship. No new routes or database tables in this PR.
- **2b — persistence:** versioned schema, atomic assignment, recipient capture,
  immutable snapshots, access enforcement and revisioned saves, verified with
  local database integration tests.
- **2c — authenticated API:** services, endpoint contracts and thin routes for
  the operations below, including stable learner and tutor read models.

These are review boundaries within slice 2, not separate product milestones.
The slice is only complete when its API exit criteria pass.

- Implement assignment snapshots and individual participation types, then
  versioned local database migrations and generated database types.
- Persist writing responses and clinical care plans; the response references
  the authoritative document instead of storing a second copy.
- Implement tenant/learner access rules, transactional assignment, revisioned
  saves and stable read models. Follow existing service/contract/route layers.
- Add separate local integration tests for isolation, repeat assignment,
  concurrent edits, source-content changes and cleanup of test fixtures.

Exit: a learner can save and reload both activity types through authenticated
APIs; cross-learner and cross-organisation attempts fail at the server/database.

Initial route shape to implement in this slice (not existing endpoints):

| Operation                                        | Proposed route                                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Browse/preview curated content                   | `GET /api/organisation/learning-experiences` and `/:experienceId`                                          |
| Assign to an authorised group                    | `POST /api/organisation/learning-experience-assignments`                                                   |
| List/open the caller's assigned work             | `GET /api/organisation/learner-experiences` and `/:learnerExperienceId`                                    |
| Save an activity response                        | `PUT /api/organisation/learner-experiences/:learnerExperienceId/activities/:activityId/response`           |
| View scenario plus individual clinical additions | `GET /api/organisation/learner-experiences/:learnerExperienceId/scenarios/:scenarioId/resolved-record`     |
| Tutor inspection of assigned learners            | `GET /api/organisation/learning-experience-assignments/:assignmentId/learners` and `/:learnerExperienceId` |

Services must resolve learner identity from the authenticated membership and
check every route identifier against that context. Tutor inspection is a separate
read permission, never an alternative way to save a learner's work.

### 3. Learner demonstration

- Add Learning Experiences entry, assigned experience overview and activity views.
- Support writing and structured care-plan editing with clear save/conflict states.
- Resolve the scenario plus the learner's clinical additions whenever the EHR
  is opened; progression must retain the care plan.
- Verify the second scenario and provide reproducible synthetic demo content.

Exit: browser coverage proves sign-in, launch, save, sign-out/resume, EHR care-plan
visibility, scenario progression and isolation from another learner.

### 4. Tutor demonstration

- Preview the seeded experience, select an authorised group and assign it.
- Provide a read-only view of individual learner work.
- Support explicit tutor/group grants administered by an organisation admin.

Exit: the full tutor-to-learner story runs locally using real permissions and
persistent work. Broad catalogue search and arbitrary experience authoring can
follow this first demo.

### 5. Staging readiness and release

Prepare configuration and a concrete release checklist while the product slices
progress; do not deploy an incomplete demo just because hosting is available.

- Verify the GitHub/Vercel setup and choose a stable staging address, isolated
  hosted Supabase project, environment values and authentication callbacks.
- Confirm which apps the demo needs: the existing workflow deploys `apps/web`;
  the development identity simulator is not a staging prerequisite.
- Prepare reviewed migration/seed promotion and a repeatable demo-data procedure.
  The existing deployment workflow does not apply hosted database migrations.
- Close outstanding validation and generated-file churn. Preserve unrelated work.
- Run CI-equivalent checks, local database integration tests and the demo browser
  suite. Rehearse deployment-specific build and rollback steps.
- Review changes through draft pull requests. Obtain explicit authorization for
  merging and for the concrete hosted release; creating review PRs does not
  approve either action.
- After deployment, verify the full story at the staging URL, including account
  access, persistence, isolation and synthetic-data identification.

Exit: a stable staging URL and prepared tutor/learner accounts demonstrate the
release story reliably. Record what was deployed, validation and known limits.

## Progress and evidence

- Baseline: patient profiles, admin EHR previews, Esther's cumulative scenario,
  scenario catalogue/basic editing and organisation membership tools exist.
- Draft Learning Experience types exist; learner delivery and persistence do not.
- Turbo task-cache cleanup/configuration is separate maintenance work for its own
  PR. It excludes `.next/dev` and sets `5GB` / `14d` retention.
- Slice 1 types, schemas and regression coverage are implemented. The types
  package's 49 tests pass, including 27 new tests. Its typecheck and lint pass.
  These checks were recorded with slice 1; the fresh build and checks below
  verify the merged foundation together with slice 2a.
- Slice 2a adds assignment/group context to each learner participation. An
  assignment captures the experience and full scenario definitions (patient
  version, layers, steps and starting EHR configuration). Strict input accepts
  only experience and group IDs; actor, tenant and recipients must be resolved
  by the future service. Schemas check content consistency, not permissions or
  database immutability.
- Slice 2a validation: all 70 types-package tests pass, including 21 added
  assignment/snapshot checks. `yarn check` passes. `yarn build --concurrency=1`
  passes with fresh web/simulator builds and cached docs/website builds.
  Database integration and browser tests were not run for this types-only PR.
- Persistence, authenticated endpoints and browser flows remain unimplemented.
  Review this boundary before proceeding to the migration and service work.
