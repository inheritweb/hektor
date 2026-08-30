# EHR programme plan

Status: agreed programme direction. The patient-profile model is specified in
`docs/patient-profile-model.md` and should be reviewed before implementation.

## Product intent

Hektor's first learning project will be an Electronic Health Record simulation.
It will preserve and improve the existing EPR Unified learning experience while
moving identity, authoring, persistence, assignment, progression and assessment
into Hektor.

A patient profile is reusable learning content, not an EHR-owned record. The same
profile may support an EHR experience, an interprofessional case discussion, a
communication exercise, a medicines activity or another future project. An EHR
is one presentation and interaction model applied to selected patient content.

The system must support:

- a curated system library of patient profiles;
- personally owned copies for individual learning where the product entitlement
  permits them;
- organisation-owned copies that tutors can adapt when their licence permits;
- repeatable, configurable patient projects that evolve through defined stages;
- many projects and learner instances running concurrently at different stages;
- learner work that survives later changes to source content, assignments,
  organisation membership and canonical cohorts or groups;
- formative and summative tutor assignments against an EHR experience; and
- explicit clinical provenance, review and simulation-only safeguards.

## What exists today

The source application is a static browser application in
`DNMSW/epr-unified`. At review time it contains 27 JavaScript patient data files,
large patient-specific EHR documents, cross-programme entry points, a static
DM+D search dataset and browser-local answer persistence.

Its strongest assets are:

- substantial authored clinical and educational content;
- realistic variation across acute, community, mental-health, paediatric,
  maternity, pharmacy, medicine and interprofessional cases;
- patient-aware adaptation rather than mechanically applying every clinical
  tool to every setting;
- a recognisable simulated EHR interaction model;
- embedded risk tools, observations, referrals, care planning and reflection;
  and
- an emerging separation between shared patient facts and EHR presentation.

The integration should retain those assets, but not retain the current runtime
architecture. Important constraints in the source are:

- patient facts, encounter state, teaching instructions and UI markup are still
  mixed together;
- patient pages duplicate large quantities of HTML, CSS and JavaScript;
- learner answers are stored in `localStorage` by DOM field position, so content
  edits can misassociate saved answers and work cannot follow a learner between
  devices;
- authentication and authorization are client-side gates rather than Hektor
  permissions;
- authored defaults and learner-entered clinical documentation are not distinct
  durable records;
- calculators and conditional clinical behavior are embedded independently in
  pages and lack a central validation and test boundary;
- there is no content lifecycle, version pinning, structured clone provenance,
  audit history or controlled publication process; and
- the static pages are not an appropriate long-term unit for accessibility,
  clinical-content assurance or automated end-to-end testing.

## Proposed domain boundaries

These are conceptual boundaries for planning, not final table names.

### Patient library

Owns reusable simulated patient identity, demographics, background, clinical
facts, relationships, assets, provenance and review state. It distinguishes
system-curated, user-owned and organisation-owned profiles and records lineage
when content is cloned.

### Patient project

Owns an authored learning narrative around a patient. A project selects patient
content, defines its audience and learning intent, and may contain a sequence of
repeatable stages such as initial presentation, deterioration, investigation
results, intervention and follow-up. Project configuration must be cloneable and
editable without rewriting the original system project.

### Clinical experience

Owns the EHR-specific projection: available record sections, clinical tools,
read-only source material, learner-editable fields, calculations and interaction
rules. This boundary should later permit other experience types to consume the
same patient project without depending on EHR components.

### Assignment and delivery

Owns tutor publication to an organisation audience, scheduling, stage release,
learner allocation and licence enforcement. A published assignment pins the
content/configuration learners receive; later author edits must not silently
change in-progress or assessed work.

### Learner work and assessment

Owns each learner's isolated experience state, clinical entries, reflections,
submissions, feedback and assessment history. Learner documentation must never
mutate the source patient profile or leak into another learner's instance.

## Evolution model

Patient evolution will be modeled as ordered conceptual layers and deterministic
changes, not as ad hoc mutations to a shared patient row. The baseline patient
profile is implicit layer zero. Each subsequent layer represents a meaningful
moment in the authored narrative.

For example:

1. A tutor publishes a project containing layers for weeks 1, 2 and 3.
2. Each assignment pins an authored project version and its patient-profile
   version.
3. Each learner receives an independent experience instance at layer 1.
4. A release rule advances or unlocks layer 2 while preserving the exact layer-1
   record and learner work.
5. Layer 2 adds or supersedes defined clinical facts, results, documents and EHR
   entries.
6. Another cohort can run the same project concurrently on a different schedule,
   and a tutor-owned clone can evolve independently from the system original.

Layers store typed operations and are rendered cumulatively from the pinned
baseline. Moving backwards or forwards recomputes the effective record rather
than applying inverse mutations. Published project versions are immutable, so
the same layer always produces the same result. The first implementation will
use a linear sequence; stable layer identities leave room for deliberate
branching later without making the initial authoring model ambiguous.

## Delivery sequence

### Phase 0 — content discovery and vocabulary

- Inventory current patient fields, EHR sections, authored defaults, learner
  inputs, calculators, documents and programme-specific variations.
- Classify each item as patient truth, project narrative, stage change, EHR
  configuration, learner work, assessment or presentation.
- Agree canonical product language and the minimum clinical governance metadata.
- Design the patient-profile model and migration/import approach as a separate,
  reviewed plan before creating tables.

### Phase 1 — platform patient-profile library

- Add a new migration for the agreed patient-profile model.
- Give platform administrators a searchable, filterable patient library.
- Support create, view, edit, archive and controlled publication workflows.
- Record system ownership, provenance, review status, audit metadata and assets.
- Import a small representative set rather than all existing cases at once.
- Establish contract, service, database-integration, component and browser tests.

The representative set should cover materially different structures: an acute
adult, a community patient, a mental-health patient, a child or maternity case,
and an interprofessional case.

### Phase 2 — tutor discovery and licensed cloning

- Let tutors browse and preview the published system patient library without
  exposing platform authoring controls.
- Enforce the organisation licence at the service/API boundary.
- Permit an eligible tutor to clone a system profile into their organisation.
- Preserve lineage to the source and version while making the copy independently
  editable.
- Ensure one organisation cannot discover another organisation's private copies.
- Define what happens when the system source is later corrected or withdrawn;
  clones must not silently change.

This is the first tutor-facing vertical slice. It ends at a trustworthy,
organisation-owned patient copy and does not yet include learning-experience
authoring.

### Phase 3 — patient projects and layered evolution

- Create, clone and edit patient projects independently from patient identity.
- Attach a patient-profile version and configure an ordered layer sequence.
- Author typed changes to clinical facts, results, documents and record entries.
- Preview any layer and compare it with the preceding layer.
- Validate impossible references and incomplete configurations before publish.
- Add explicit draft, published, superseded and archived lifecycle states.

### Phase 4 — EHR application foundation

- Convert the reusable visual language from the source application into Hektor
  components and Storybook stories, following `COMPONENTS.md`.
- Render a read-only EHR from structured patient/project content first.
- Add schema-driven learner fields, central tested calculators and autosave.
- Preserve the clinical setting adaptations present in the source content.
- Meet keyboard, screen-reader, responsive and contrast requirements before
  expanding the section catalogue.

### Phase 5 — tutor assignments and learner delivery

- Let tutors assign a published EHR project to cohorts, groups or selected users.
- Pin versions and configure availability, stage release and due dates.
- Create isolated learner experience instances and durable server-side work.
- Support save, resume, submission, late/locked states and immutable submission
  snapshots.
- Ensure suspended memberships retain read-only history and reassignment never
  merges learner records.

### Phase 6 — feedback, assessment and operational maturity

- Add assignment criteria, tutor feedback, formative/summative outcomes and
  moderation where required.
- Add reporting without exposing unrelated learner or organisation data.
- Add content-quality review, project validation, audit views and operational
  documentation.
- Expand the imported patient and EHR-section catalogue iteratively, with
  clinical review and regression fixtures.

## Cross-cutting rules

- All people and clinical records are fictional simulation content; the UI and
  exports must state this consistently.
- Use synthetic identifiers rather than identifiers that could be mistaken for
  genuine NHS numbers unless a reviewed simulation convention is adopted.
- Patient content ownership and organisation tenancy must be explicit at every
  query boundary; a user-owned profile is private to that user unless a later
  sharing workflow explicitly says otherwise.
- Published and in-use content is versioned or pinned; editing a draft cannot
  rewrite learner history.
- Clone operations copy an authored baseline and retain provenance. They do not
  create a live inheritance relationship by default.
- Licence checks belong at trusted service/API boundaries, not only in UI
  visibility.
- Calculations with clinical meaning require named definitions, source/review
  metadata, deterministic implementations and focused tests.
- Rich clinical content and uploaded assets require sanitization, constrained
  formats and deliberate accessibility alternatives.
- The existing frontend is a content and interaction reference. Hektor's shared
  components, contracts and domain services remain the implementation boundary.

## Patient-profile design decisions

The detailed model resolves the first implementation in
`docs/patient-profile-model.md`. The following remain explicit product or
clinical-governance decisions rather than implicit implementation choices:

1. Which attributes are stable patient identity/background versus facts that
   belong to a project, encounter or stage?
2. How should authored clinical facts be typed while still permitting specialty
   variation and future non-EHR experiences?
3. What is the smallest useful versioning and publication model for system,
   user-owned and organisation-owned profiles?
4. What exactly is cloned, which provenance is retained, and can a clone ever
   opt into upstream corrections?
5. Which platform roles may author, clinically review, publish, archive and
   restore profiles?
6. Which licence capability enables preview, clone, private authoring and later
   delivery?
7. How should documents and images be represented and reviewed?
8. Who provides clinical approval for each imported profile and subsequent
   correction?
9. What identifiers and demographic conventions make synthetic status
   unmistakable?
10. What audit and retention guarantees are required before learner work is
    introduced?

## Initial success measure

The first patient-profile slice is complete when a platform administrator can
publish a clinically reviewed system profile, an entitled tutor can find and
clone it into the selected organisation, an unauthorized organisation cannot
access that copy, the clone can be edited without changing the system source,
and all lineage and version information remains explainable through tests and
the UI.
