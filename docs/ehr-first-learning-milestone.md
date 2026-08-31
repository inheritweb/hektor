# EHR first learning milestone

Status: proposed implementation sequence. This plan deliberately stops at the
first complete tutor-to-learner learning loop.

## Outcome

A tutor can choose and preview a curated EHR, create an exercise containing
questions or a mock care plan, assign it to learners, and view their submitted
work. A learner can open the assignment, review the EHR, save and resume their
work, and submit it.

## Explicitly deferred

- patient-profile cloning or tutor editing;
- patient projects and narrative layers;
- staged or branching patient evolution;
- prescribing, medicines administration and clinical calculators;
- complex rubrics, marking, feedback, moderation and reporting; and
- importing the full prototype catalogue.

The current platform-admin patient-profile editor remains useful for curating
system source material, but it is not a dependency of the tutor workflow.

## Minimum domain model

### EHR definition and version

An EHR definition identifies a learner-facing record and owns its display name,
description and lifecycle. An immutable version pins one published
patient-profile version and a small EHR configuration describing the enabled
read-only sections. The first configuration can use one system template rather
than supporting arbitrary section authoring.

### Exercise definition

An exercise is the work a learner completes while reviewing an EHR. Its ordered,
stable-ID activity blocks initially support:

- `question`: prompt plus short- or long-text response mode; and
- `care_plan`: one or more rows containing identified need/problem, goal,
  planned interventions and evaluation.

Tutor instructions and optional learner guidance belong to the exercise. Patient
facts do not.

### Assignment

An assignment belongs to one organisation and records its tutor, title,
instructions, availability window, due date and lifecycle. It pins an immutable
EHR version and an exercise snapshot. Audience rows target cohorts, groups or
individual memberships. Expansion to actual learner allocations occurs at
release and is auditable.

### Learner attempt

An attempt belongs to exactly one assignment allocation and learner. It stores
draft response data separately from the source EHR, save revision/time and
submission state. Submission creates an immutable response snapshot. A retry or
later attempt must be a new record, never an overwrite of submitted work.

## Access rules

- Platform administrators curate system patient profiles and EHR definitions.
- Tutors can see only published EHRs available to their active organisation and
  can manage only that organisation's assignments.
- Learners can see only their own allocations and attempts.
- Tutor preview uses the same EHR page and exercise renderer as learners, with a
  clearly labelled preview mode and no learner attempt.
- Assignment release, audience expansion and submission are trusted service
  operations, not client-only state changes.
- Every assignment pins content. Editing a source draft cannot alter released or
  submitted work.

## Implementation slices

### Slice A — structured patient history

1. Agree and implement the revised V1 patient-history contract described in
   `docs/patient-profile-history-slice-plan.md`.
2. Separate pre-episode history from the current episode for each of the five
   source patients.
3. Import typed encounters, observations, assessments, investigations,
   procedures, medication courses, referrals, documents and care plans.
4. Extend platform-admin display and bounded draft editing.
5. Verify seed idempotency and that no current-episode or educational data
   entered the profiles.

### Slice B — EHR read model and reusable preview

1. Define the EHR definition/version contracts and migration.
2. Seed one EHR version backed by one clinically useful published patient
   profile.
3. Build shared EHR components and stories using the prototype's visual and
   content patterns without copying its page architecture.
4. Add a platform preview and a tutor-facing published-EHR catalogue/preview.
5. Verify draft exclusion, organisation context, synthetic-data labelling,
   accessibility and responsive layout.

### Slice C — exercise contract and renderer

1. Define versioned question and care-plan activity blocks with stable IDs.
2. Add server validation for block configuration and learner response shape.
3. Build one renderer used by tutor preview and learner attempts.
4. Support a tutor configuring instructions, questions and a care-plan activity
   against an EHR.

### Slice D — assignment and audience

1. Add organisation-scoped assignment, audience and allocation tables.
2. Let tutors choose an EHR/exercise, target cohorts, groups or learners, and set
   availability/due dates.
3. Provide a complete preview and explicit release action.
4. Snapshot the exercise and pin the EHR version transactionally on release.

### Slice E — learner work

1. Add the learner assignment list and launch flow.
2. Create or resume exactly one draft attempt per allocation.
3. Autosave revisioned responses and show saving, saved, conflict and error
   states.
4. Add explicit submission and preserve an immutable submission snapshot.
5. Confirm learner isolation and behaviour when membership is suspended.

### Slice F — tutor submission view

1. Show assignment progress without exposing other organisations.
2. Let the tutor open a learner's submitted snapshot alongside the pinned EHR
   and exercise.
3. Record audit events for release, launch and submission.

## First implementation choices

- Complete structured pre-episode history for all five patient profiles, then
  start the EHR projection with one representative patient; presentation breadth
  follows after the loop works.
- Use text questions and a bounded care-plan schema, not arbitrary form-builder
  fields.
- Treat the patient record as read-only throughout tutor preview and learner
  delivery.
- Reuse existing organisation cohorts, groups and memberships for targeting;
  allocations pin learner identity independently of later group changes.
- Keep medication terminology/typeahead as a separate authoring concern. The
  prototype searches a bundled representative DM+D subset; production adoption
  needs a versioned terminology source and provenance decision.

## Milestone acceptance

The milestone is complete when one tutor and one learner can perform the full
workflow through the UI, server-side permissions prevent cross-tenant and
cross-learner access, refresh/resume does not lose work, released content is
stable after source edits, and the tutor can inspect the submitted snapshot.
