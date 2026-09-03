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

The prototype's UX and information hierarchy have been refined through repeated
use by an experienced nursing lecturer and practitioner. They are product input,
not disposable scaffolding. Hektor should preserve their clinical intent,
recognisable structure and useful information density while improving
responsiveness, accessibility, consistency and maintainability. Material UX
departures should be deliberate and reviewed rather than accidental consequences
of applying generic application patterns.

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

### Patient scenario and profile layers

A `PatientScenario` selects an exact patient-profile version. Its ordered
`PatientScenarioStep` records reference `PatientProfileLayer` records. A layer
contains typed modifications to patient data and exists to serve scenarios; it
is not an independently browsable patient-library asset. The effective patient
state at a step is the immutable base profile plus every preceding layer in the
scenario stack. The first layer can establish the initial presentation and later
layers can introduce results, deterioration, treatment or follow-up.

### Clinical experience

Owns the EHR-specific projection: available record sections, clinical tools,
read-only source material, learner-editable fields, calculations and interaction
rules. This boundary should later permit other experience types to consume the
same patient project without depending on EHR components.

The base EHR is an ordered composition of thirteen controlled core section
types. Section instances have stable identities and sparse integer order values.
The current work stops at this base EHR structure. In later phases, a
clinical-audience view may adapt it for a profession, specialty and care setting,
and a scenario may adapt it further. Those future composition mechanics must
remain distinct from `PatientProfileLayer` records: the former would change
presentation and workflow composition; the latter change resolved patient
facts.

Clinical audience is not an authorization role. Learner, tutor and platform
administrator govern permissions; pharmacist, GP, community nurse,
mental-health nurse or surgeon describe the simulated professional perspective.

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

Patient evolution will be modeled as ordered profile layers and deterministic
changes, not as ad hoc mutations to a shared patient row. The baseline
`PatientProfile` is always layer zero. A `PatientScenarioStep` determines when a
referenced `PatientProfileLayer` joins the stack.

For example:

1. A scenario pins a published patient-profile version and contains ordered
   steps for weeks 1, 2 and 3.
2. Each step references the layer applied at that moment.
3. Each learner receives an independent experience instance at layer 1.
4. A release rule advances or unlocks layer 2 while preserving the exact layer-1
   record and learner work.
5. Layer 2 adds or supersedes defined clinical facts, results, documents and EHR
   entries.
6. Another cohort can run the same project concurrently on a different schedule,
   and a tutor-owned clone can evolve independently from the system original.

Layers store typed operations and are rendered cumulatively from the pinned
baseline. Moving backwards or forwards recomputes the effective record rather
than applying inverse mutations. Published scenarios and their layer stack are
immutable, so the same scenario step always produces the same result. The first
implementation will use a linear sequence; stable step and layer identities
leave room for deliberate branching later without complicating initial
authoring.

## Delivery strategy

The first major milestone is now a complete learning loop, not patient-library
cloning or narrative authoring. A tutor selects a curated EHR, previews it,
configures an exercise, assigns it to learners, and can review the submitted
work. A learner opens the assignment, reviews the EHR and answers questions or
completes a mock care plan.

This milestone deliberately uses published system patient profiles and a single
baseline EHR state. It does not require tutors to clone or edit patient records,
patient projects, narrative layers, staged release, calculators, prescribing or
complex marking. Those capabilities remain compatible with the domain model but
are no longer prerequisites for proving the learning experience.

The detailed milestone plan is in `docs/ehr-first-learning-milestone.md`.

## Current execution plan

This sequence replaces earlier assumptions that a representative seed or a
general enrichment pass was sufficient evidence of content completeness.

1. **Complete one reference profile — Esther Jenkins — completed.** Inventory every
   patient-specific assertion in the prototype and give it a recorded
   disposition: patient profile, future profile layer, teaching/UI content,
   duplicate, or deliberate omission. Every profile fact must be represented in
   the V1 document and visible in platform admin.
2. **Roll the reconciliation process out to the other four profiles — completed.** Use the
   same evidence and acceptance criteria, extending the contract only when an
   actual source fact cannot be represented faithfully.
3. **Add platform-admin “View in EHR” — in progress.** Completed the first
   increment: CTA, shell-free full-screen preview route, reusable simulation
   template, patient header metadata and corner simulation-tools drawer. Continue
   with a deterministic, read-only projection of base-profile sections. Do not
   add persisted generic EHR configuration until a concrete variation requires
   it.
   The next increment is specified in `docs/ehr-ui-slice-2-plan.md`.
4. **Implement scenario mechanics — planned.** Add `PatientScenario`,
   `PatientScenarioStep` and `PatientProfileLayer` to the contracts, database and
   platform-admin experience. A scenario pins a profile version and its steps
   order the layers applied over that base. Begin with a read-only Esther acute
   stroke scenario: scenario pods below the patient-profile title/description,
   then a cumulative step-aware EHR preview in the persistent simulation-tools
   drawer. The bitesize delivery plan is in
   `docs/patient-scenario-preview-plan.md`.
5. **Consider the tutor experience.** Design tutor browsing, preview and later
   assignment workflows against working base-profile and scenario EHR previews.

A profile is source-complete only when every patient-specific prototype
assertion has a documented disposition and everything allocated to the profile
is represented and displayed. “Clinically reviewed” remains a later governance
state requiring an appropriate reviewer; it is not silently implied by source
completeness.

## Revised delivery sequence

### Phase 0 — content discovery and vocabulary — substantially complete

- Completed: prototype review, initial content classification, patient-profile
  vocabulary and the reviewed profile model/import approach.
- Outstanding as each EHR section is adopted: classify its authored defaults,
  learner inputs, calculations and specialist variations.
- Required for every module: begin with Esther's prototype, identify equivalent
  content even where it is named or grouped differently, then check the other
  current profiles and wider corpus for variation before fixing the generic
  boundary.

### Phase 1 — platform patient-profile foundation — in progress

- Completed: schema migration, production-safe seed, five representative system
  profiles, platform-admin catalogue/detail views and structured draft editing.
- Outstanding: search/filter controls, create/archive/publication workflow,
  clinical review UI, assets and fuller automated/browser coverage.

The representative set should cover materially different structures: an acute
adult, a community patient, a mental-health patient, a child or maternity case,
and an interprofessional case.

### Phase 2 — structured patient history and source reconciliation — complete

- Replace the generic clinical-fact ledger in the unreleased V1 contract with typed historical encounters,
  observations, assessments, investigations, procedures, medication courses,
  referrals, documents and care plans.
- Use the current-episode start as the boundary: everything clinically relevant
  before it belongs to patient history; the active episode and its existing or
  later records do not. The episode can begin before the learner sees the EHR.
- Inventory and import the available pre-episode history for all five seeded
  profiles without inventing missing clinical detail or date precision.
- Regenerate the five draft documents and production seed against the revised V1
  contract; no compatibility version is required before release.
- Extend platform-admin display and bounded draft editing for the new records.
- Completed: reconciled Esther as the reference case, then applied the same
  source-disposition and acceptance process to the other four profiles.

The detailed plan is in `docs/patient-profile-history-slice-plan.md`. This slice
ensures the EHR consumes the patient's past rather than owning or duplicating it.

### Phase 3 — read-only EHR projection and tutor preview — in progress

- The prototype remains authoritative evidence of clinical workflows and
  patient-specific variation, but no single prototype patient's navigation is
  the generic EHR information architecture.
- Current next slice: establish the controlled thirteen-module core EHR
  composition, its registry and deterministic sparse ordering, then render the
  first module across the five current profiles. It does not implement clinical
  audiences or scenarios. The bounded plan is in
  `docs/ehr-generic-sections-slice-plan.md`.
- Patient-specific presenting-history and specialty assessment sections will be
  added later as scenario-selected modules rather than universal navigation.
- Learner-entered clinical documentation remains in the EHR when it represents
  real clinical record work. Educational questions, reflection and assessment
  scaffolding belong in the simulation-tools panel.
- Completed: the platform-admin version-pinned preview entry point, full-screen
  simulation surface, prototype-aligned patient banner, responsive record
  navigation, Patient details section and out-of-simulation tools drawer.
- Superseded: the generic communication/relationships and problems/allergies
  top-level sections. Their data projections remain useful but will move into
  Esther's prototype-defined sections.
- Completed as discovery: an Esther-specific A–C reconstruction exposed the
  distinction between generic record sections, scenario/specialty modules and
  learning activity. It is now an input to the abstraction rather than the
  universal target navigation.
- Define a versioned EHR projection over a published system patient-profile
  version.
- Build the reusable EHR shell and the smallest useful read-only section set
  from the prototype: patient banner, summary, clinical history, allergies,
  medications, communication needs and clinical record.
- Let tutors browse available EHRs and open the exact learner-facing preview in
  their active organisation context.
- Keep platform authoring controls and draft content unavailable to tutors.
- State synthetic-patient and preview status consistently and meet keyboard,
  responsive and screen-reader requirements.

This is the first tutor-facing slice. It ends at a trustworthy preview of a
published, baseline EHR and introduces no cloning.

### Phase 4 — exercise definition and tutor assignment

- Let a tutor select an available EHR and choose one or more response activities:
  short or long-answer questions and a structured mock care plan.
- Capture assignment title, instructions, audience, availability and due date.
- Target cohorts, groups or selected learners inside the active organisation.
- Pin the EHR, patient-profile and exercise definition used by the assignment so
  later source edits cannot change learner work.
- Provide tutor preview of the complete assignment before release.
- Enforce tutor role, organisation tenancy and any delivery entitlement at the
  trusted API boundary.

### Phase 5 — learner run, persistence and submission

- Show each learner only assignments addressed to them through current valid
  organisation membership.
- Create one isolated learner attempt from the assignment's pinned snapshot.
- Render the read-only EHR beside the exercise without mutating patient content.
- Autosave answers and care-plan entries server-side with clear saved, stale and
  error states.
- Support resume and explicit submission with an immutable submission snapshot.
- Give tutors a simple submission view. Rich marking and feedback remain later.

Completion of Phase 5 is the first major EHR milestone.

### Phase 6 — richer assessment and EHR interactions

- Add feedback, marking criteria, formative/summative outcomes and moderation.
- Add further structured activities, clinical forms and tested calculators.
- Expand the EHR section catalogue and preserve setting-specific adaptations
  from the prototype.
- Add operational reporting without exposing unrelated learner data.

### Phase 7 — deferred authoring and longitudinal capability

- Add organisation/user patient-profile cloning and private authoring.
- Add patient projects, deterministic narrative layers and staged release.
- Add clone provenance, project publication and richer content review.
- Add longitudinal learner experiences only after the baseline assignment loop
  is reliable.

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

## First major milestone success measure

A tutor can preview a published synthetic EHR, create an assignment containing
questions or a mock care plan, target learners in their organisation and release
it. An assigned learner can open the same pinned EHR, save and resume their work,
submit it, and the tutor can view that immutable submission. Neither participant
can mutate the source patient profile, and no data crosses organisation or
learner boundaries.
