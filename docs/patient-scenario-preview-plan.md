# Patient scenario and EHR preview plan

Status: implementation in progress. Slices 1 through 5 are complete.

## Outcome

A platform administrator can open Esther Jenkins's patient-profile detail page,
see her available scenarios as pods below the profile title and description, and
open the acute-stroke scenario in the full-screen EHR preview. The simulation
tools drawer shows the ordered scenario steps. Selecting a step keeps the drawer
open and redraws the EHR using Esther's immutable base profile plus every layer
up to that step.

The first milestone proves scenario composition and preview. It does not provide
scenario authoring, cloning, assignments, learner progression or submissions.

## Agreed model

The model has four domain entities:

1. `PatientProfile` is the reusable base and remains layer zero.
2. `PatientProfileLayer` contains typed clinical-record changes and exists to
   serve scenarios.
3. `PatientScenario` contains an exact patient-profile version and its ordered
   steps, and describes the overall clinical situation.
4. `PatientScenarioStep` is an ordered moment. It contains one profile layer and
   may also contain EHR composition changes.

Domain aggregates must improve on the relational storage shape. Foreign-key
fields such as `patient_profile_version_id` and `patient_profile_layer_id` belong
to database rows and mappers; application code receives `scenario.patientProfile`,
`scenario.steps` and `step.patientProfileLayer` as composed objects.

The first scenario step is always the **beginning** step. Its layer establishes
the presenting condition and initial episode state. Later steps accumulate over
it; they do not replace it.

```text
pinned PatientProfileVersion
  + beginning PatientProfileLayer
  + every preceding step layer
  = resolved patient record at the selected step

base EHR composition
  + scenario beginning EHR changes
  + every preceding step EHR change
  = resolved EHR at the selected step
```

Moving backwards or forwards always resolves from the pinned base. It never
mutates a shared patient record and never relies on applying inverse changes.

## First reference scenario

Use Esther Jenkins and the acute ischaemic stroke material already classified
in `docs/patient-profile-reconciliation-esther-jenkins.md`.

The production seed contains three authored steps:

1. **Admission to the stroke unit** — the required beginning step. It introduces
   the presenting symptoms, acute encounter, residual neurological findings,
   initial observations and admission investigations. It also adds the
   acute-presentation and neurological EHR sections needed to present them.
2. **Swallowing and communication review** — adds Esther's patient-reported
   post-stroke chewing and coughing symptoms and her observed communication
   position to the existing assessments module. It does not rename or add an
   EHR section, and it does not invent a completed swallow screen, diet/fluid
   decision or referral from the prototype's learner-completed fields.
3. **Functional and psychological review** — adds Esther's patient-reported
   loss of function, low mood, anxiety and disturbed sleep. It excludes the
   prototype's learner-completed mood screen, referral and assessment fields,
   and it leaves the EHR section configuration unchanged.

The prototype presents multidisciplinary material and discharge planning in the
same broad admission state. They remain candidate progression boundaries, but
must not be split into invented moments without authored timing or domain
review.

The exact content and boundary of every step must be reconciled against Esther's
prototype before it is seeded. Learner-selectable fields, prompts and unfinished
clinical decisions are not converted into authored facts.

## Contract shape

Canonical TypeScript types belong in `packages/types`; Zod schemas validate API,
database and seed boundaries and must satisfy those types.

### `PatientScenario`

- stable ID and human-readable slug;
- title and short description;
- exact `patientProfile` version, including its validated document;
- scope and status sufficient for a system-owned draft in the first slice;
- care setting and optional intended clinical audiences as descriptive
  metadata, not authorization roles; and
- ordered `steps`, whose first item is the beginning step.

### `PatientScenarioStep`

- stable ID;
- title and optional description;
- sparse integer position (`10`, `20`, `30`...);
- kind: `beginning` or `progression`;
- composed `patientProfileLayer`; and
- ordered EHR changes for that moment.

Domain validation enforces exactly one beginning step, requires it to be first,
and prevents duplicate positions. Persistence mappers assemble the domain step
from its scenario and layer foreign keys.

### `PatientProfileLayer`

- stable ID and owning patient-profile ID;
- title and description;
- schema version;
- ordered typed operations; and
- provenance and timestamps.

The layer must target the same patient profile as the scenario's pinned version.
A layer is not listed independently in the patient library.

### Typed layer operations

Do not use generic recursive JSON merge. Collections have stable item IDs, so
the initial operation vocabulary should be explicit and identity-aware:

- add an item to a supported collection;
- replace an item selected by stable ID;
- remove an item selected by stable ID; and
- set or clear an approved scalar/object field where a collection operation is
  inappropriate.

The supported paths are a controlled enum derived from the V1 patient document,
not arbitrary JSONPath strings. Operation payloads use the existing patient
document item contracts. Invalid paths, duplicate additions, missing replacement
targets and incompatible values fail resolution rather than being ignored.

### EHR changes

EHR changes alter presentation, not clinical truth. The first vocabulary is:

- insert a section instance at a sparse order value;
- configure or retitle a scenario-owned section instance;
- hide or reveal a section instance; and
- move a section by assigning a new order value.

Each section references the controlled EHR module registry. A step may have no
EHR changes. Removing core clinical data through presentation configuration is
not the same as deleting it from the resolved patient record.

## Persistence

Add a new migration rather than modifying existing migrations. The first schema
uses:

- `patient_scenarios` for the scenario identity, pinned profile version and
  system ownership;
- `patient_profile_layers` for validated typed clinical operations; and
- `patient_scenario_steps` for sequence, layer reference and EHR changes.

JSONB is appropriate for the validated operation arrays; relational columns own
identity, references, ordering and authorization boundaries. Foreign keys and
checks enforce patient/profile consistency wherever PostgreSQL can do so. A
service mapper joins those rows into the richer domain aggregate before the
resolver or UI receives them, and the service performs full contract and
cross-document validation transactionally.

Only trusted platform-admin services may read scenario drafts in this milestone.
Do not expose these records through tenant-scoped APIs or direct browser
Supabase access. Regenerate database types after the migration.

The production seed adds one deterministic system scenario for Esther with
deterministic scenario, step and layer UUIDs. Seed application must remain
idempotent and must validate every layer and EHR operation before SQL generation.

## Deterministic resolver

Implement a pure resolver in the services package before UI work. Given a
validated scenario aggregate, base EHR configuration and selected step, it must:

1. confirm the selected step belongs to the scenario;
2. sort steps by position and select the prefix ending at that step;
3. deep-copy `scenario.patientProfile.document` and apply each step's composed
   patient layer in order;
4. validate the resolved V1 patient document after every layer;
5. apply the same step prefix to the base EHR composition;
6. return the resolved patient document, resolved EHR sections and step context;
   and
7. produce the same result for the same inputs without database writes.

Unit tests cover accumulation, backward navigation, ordering, missing targets,
duplicate IDs, invalid operations, cross-patient references and immutability of
the input document. A fixture test proves Esther at every seeded step.

## Platform-admin APIs

Add platform-admin-only contracts and routes:

- list scenarios for a patient-profile version;
- retrieve scenario metadata and ordered steps;
- resolve a selected scenario step for EHR preview.

The response supplies previous/next step context and the canonical current-step
URL. It never returns unvalidated raw database JSON. Existing platform-admin
authentication and error handling must be reused.

Authoring endpoints are deliberately absent from the first milestone.

## Platform-admin patient-profile UX

On patient-profile detail, place a **Scenarios** region directly below the
profile title and description and before the clinical profile sections.

Each responsive pod shows:

- scenario title;
- concise description;
- care setting;
- number of steps;
- draft/published status when useful; and
- a **Preview scenario in EHR** action that opens a new tab.

The list is for the currently viewed patient-profile version. An empty state
explains that no scenarios have been configured for that version. Do not show
Esther's scenario while viewing a different profile version unless it explicitly
pins that version.

The existing **Preview in EHR** action remains the base-profile preview and must
not silently select a scenario.

## Scenario EHR preview UX

Use the global full-screen EHR experience, not an admin-themed page. Proposed
routes are:

```text
/ehr/scenarios/{scenarioSlug}
```

The route initially resolves to the beginning step. Step selection is local
state owned by the preview controller above the EHR; persistence and learner
progression will later belong to a simulation run. Step identifiers are not
exposed in the browser URL. The preview tools drawer adds a scenario area
containing:

- scenario title and explicit **Preview** status;
- current step title and user-facing sequence label;
- a compact ordered step list;
- side-by-side **Previous step** and **Next step** controls; and
- an exit action returning to the originating patient-profile detail page.

Selecting a step uses Next.js client navigation so the simulation shell and open
drawer remain mounted. The EHR content redraws from the resolved response; the
browser must not perform a full-page navigation. The selected step has clear
visual and accessible state, and controls expose useful tooltips without
overflowing the drawer.

The patient banner remains Esther's. Scenario-specific EHR sections are composed
into the same responsive, prototype-informed EHR navigation and content surface.
The UI must not present educational prompts as clinical record content.

## Bitesize delivery slices

### Slice 1 — contracts and resolver — completed

- define the four domain contracts and controlled operation enums;
- implement the pure patient/EHR resolver;
- add focused unit tests and worked Esther fixtures; and
- document any prototype fact that the operation model cannot represent.

No database or UI changes.

### Slice 2 — database and Esther production seed — completed

- add the three tables in a new migration;
- regenerate database types;
- add the reconciled Esther scenario, steps and layers to the production seed;
- make seed generation and repeat application deterministic; and
- add focused integration coverage for constraints, authorization and
  idempotency.

No authoring UI.

### Slice 3 — admin scenario pods and read APIs — completed

- add platform-admin list/detail/resolve contracts and routes;
- render responsive scenario pods beneath the patient title/description;
- add loading, failure and empty states, and expose the pinned profile version;
- reserve the scenario preview action without linking to a route until Slice 4;
  and
- keep base EHR preview unchanged.

### Slice 4 — beginning-step EHR preview — completed

- add the scenario preview routes;
- resolve and render Esther's beginning layer;
- apply its EHR section changes; and
- show scenario/step context in the persistent tools drawer.

This is the first visible end-to-end milestone.

### Slice 5 — local timeline controller — completed

- expose all reconciled Esther steps in a compact timeline;
- keep step selection in the preview controller without changing the URL;
- resolve the selected step through the API and redraw the EHR in place;
- preserve the open drawer while resolved content changes; and
- display **Beginning** or a derived ordinal rather than the sparse database
  position.

Esther's three steps exercise cumulative in-place resolution. Additional
progression still requires a reviewed temporal boundary rather than dividing
the remaining prototype sections arbitrarily.

### Slice 6 — review and hardening

- compare every step against Esther's prototype with the domain expert;
- complete accessibility, responsive and failure-state review;
- record clinical-content provenance and review status; and
- decide what scenario authoring needs to exist before designing edit APIs or
  forms.

## Acceptance criteria

- Esther's profile detail shows the scenario pod in the required location.
- Base-profile EHR preview and scenario preview are distinct actions.
- Opening the scenario starts at its beginning layer in a new tab.
- Each selected step resolves the pinned base plus the exact cumulative layer
  prefix and cumulative EHR changes.
- Selecting a step keeps the stable scenario URL and reproduces its cumulative
  resolved state.
- The tools drawer remains open when navigating steps and the EHR redraws without
  a full-page reload.
- Going backwards cannot retain facts or sections introduced only by later
  steps.
- Draft scenario data is accessible only to platform administrators.
- Production seed reset and repeated seed application produce the same records.
- No learner fields, assignments, cloning or authoring capability are introduced
  implicitly.

## Deferred decisions

- scenario cloning and organisation/user ownership;
- scenario draft editing, review, publication and immutable revisions;
- branching rather than a linear step sequence;
- release rules, assignment scheduling and learner-specific progression;
- clinical-audience presets and specialty-specific default compositions;
- learner work, submissions and assessment;
- relative or simulated clocks; and
- whether mature EHR configurations become reusable assets in their own right.

The Esther preview should provide evidence for these decisions rather than the
first implementation attempting to predict them.
