# Patient-profile model

Status: approved design. The document contract, database foundation and five
draft source profiles are implemented by Slice 1.

The approved first implementation slice is planned in
`docs/patient-profile-slice-1-plan.md`.

## Design outcome

A patient profile is a reusable, fictional person and their enduring background.
It is independently owned, versioned and published. It is not an encounter, an
EHR, a teaching scenario or a learner's record.

The first implementation should use relational records for identity, ownership,
publication and provenance around a typed JSON patient document. This preserves
specialty variation without turning unvalidated JSON into the domain model or
prematurely normalising every clinical concept into a table.

Patient projects will later pin a published patient-profile version and apply an
ordered sequence of conceptual layers. Layers belong to projects, not profiles.
This keeps one patient reusable in multiple experiences and makes every point in
a narrative reproducible.

## Content boundaries

### Belongs in a patient profile

- fictional identity, date of birth and demographic characteristics;
- communication, language, accessibility and reasonable-adjustment needs;
- enduring social, cultural and living context;
- relationships and carers, represented as related people rather than flattened
  contact strings;
- enduring problems, allergies and baseline medicines where they are part of the
  reusable person;
- clinically relevant background and history;
- a short neutral synopsis for library discovery; and
- content provenance, synthetic-data declaration and clinical review metadata.

### Belongs in a patient project or layer

- the presenting complaint, encounter, ward, team or referral;
- observations, results, investigations and time-specific medicines;
- deterioration, intervention, discharge and follow-up events;
- EHR alerts that arise within the scenario;
- documents and record entries at a particular narrative moment;
- module, programme, learning outcomes, prompts and facilitator instructions;
- which EHR sections and tools are visible; and
- dates relative to the authored scenario timeline.

An enduring diagnosis can be part of the profile while its current assessment,
treatment and consequences belong to a project layer. Import work must make this
classification explicitly rather than copying each source object wholesale.

### Never belongs in authored source content

- learner-entered documentation or reflection;
- assignment state, marks or feedback;
- real patient identifiers; or
- mutable state shared between learner instances.

## Data allocation map

The following matrix is the working import contract for the prototype. "Capture
now" means the first patient-profile model and production seed own the data.
"Later owner" means the source material is retained in an import inventory but
is deliberately not placed in the patient profile merely because the eventual
table does not exist yet.

| Prototype data                                                                                   | Capture now in patient profile                                                                  | Later owner and phase                                                                                                                      |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Names, preferred name, pronouns, date of birth, sex and gender where relevant                    | Yes: `identity`                                                                                 | Project UI may derive age at its scenario date.                                                                                            |
| Fictional address and contact details                                                            | Yes: `contact`, only when educationally relevant                                                | EHR projection controls whether and where these appear in phase 4.                                                                         |
| Ethnicity, faith or belief, language and cultural context                                        | Yes: `demographics` and `communication`                                                         | Project layers can later add a newly disclosed fact without rewriting the baseline.                                                        |
| Learning disability, communication preferences, accessibility and reasonable adjustments         | Yes: enduring needs in `communication` or `background`                                          | Experience configuration determines the practical UI adjustments and prompts in phase 4.                                                   |
| Family, carers, next of kin and other significant people                                         | Yes: `relationships`, with stable IDs                                                           | Participation in a particular encounter or contact is a project/layer fact in phase 3.                                                     |
| Housing, occupation, smoking, alcohol, social and family background                              | Yes when enduring: typed `background` facts                                                     | A time-specific social-work assessment or change in circumstances is a project layer in phase 3.                                           |
| Past medical, surgical, psychiatric, obstetric and family history                                | Yes when it predates and is reusable across scenarios                                           | Current pregnancy, operation, episode or active assessment belongs to a project/layer in phase 3.                                          |
| Enduring diagnoses and problem-list entries                                                      | Yes: `problems`                                                                                 | A new diagnosis, changed status or scenario-specific differential is introduced by a project layer in phase 3.                             |
| Allergies and enduring adverse reactions                                                         | Yes: `allergies`                                                                                | An allergy newly discovered during the scenario is a project-layer change in phase 3.                                                      |
| Long-term medicines forming the reusable baseline                                                | Yes: `baselineMedications`                                                                      | Acute prescriptions, administrations, reconciliation and changes belong to project layers and the EHR medication experience in phases 3–4. |
| Safeguarding and adverse-life history                                                            | Yes only when it is enduring, clinically approved and permitted by the agreed visibility policy | New disclosures, referrals and actions belong to project layers; restricted presentation is handled in phases 3–4.                         |
| Neutral synopsis, life stage, specialties, care-setting and catalogue tags                       | Yes: synopsis plus derived search projection                                                    | Learning outcomes and programme labels remain project metadata in phase 3.                                                                 |
| Synthetic-data declaration, source provenance, authorship, clinical review and publication state | Yes: version and lifecycle records                                                              | Project and EHR content receive their own provenance and review records in later phases.                                                   |
| Presenting complaint, reason for referral and current episode                                    | No                                                                                              | Patient project baseline or first layer in phase 3.                                                                                        |
| Admission, ward, bed, responsible team, community visit or appointment                           | No                                                                                              | Encounter records within project layers in phase 3.                                                                                        |
| Current observations, scores, examinations and assessments                                       | No                                                                                              | Typed clinical facts introduced or changed by layers in phase 3, rendered/calculated in phase 4.                                           |
| Laboratory, imaging and other investigation orders or results                                    | No                                                                                              | Project-layer clinical records in phase 3; EHR result views in phase 4.                                                                    |
| Care plans, referrals, progress notes, letters, handovers and discharge documents                | No                                                                                              | Layered documents/entries in phase 3; EHR forms and views in phase 4.                                                                      |
| Alerts caused by the current episode                                                             | No                                                                                              | Project layers determine alert state in phase 3; the EHR displays it in phase 4.                                                           |
| Deterioration, intervention, transfer, discharge and follow-up sequence                          | No                                                                                              | Ordered conceptual layers in phase 3.                                                                                                      |
| EHR sections, navigation, forms, calculators and editable fields                                 | No                                                                                              | Clinical-experience configuration and components in phase 4.                                                                               |
| Programme, module, profession, learning outcomes, facilitator notes and reflection prompts       | No                                                                                              | Patient-project pedagogy in phase 3, then assignment/assessment configuration in phases 5–6.                                               |
| Cohort, group, learner allocation, availability, due date and layer-release schedule             | No                                                                                              | Assignment and delivery in phase 5.                                                                                                        |
| Learner notes, form entries, calculations, reflections and saved progress                        | No                                                                                              | Isolated learner experience state in phase 5.                                                                                              |
| Submission snapshots, marks, feedback, moderation and reporting                                  | No                                                                                              | Assessment records in phase 6.                                                                                                             |

This allocation is based on meaning, not on where a value happens to sit in a
prototype JavaScript object. A source field may be split: for example, an
enduring schizophrenia diagnosis belongs to the patient profile, while the
current CMHT visit, mental-state examination and resulting plan belong to the
project's layers.

### Deliberately not modeled in the first slice

The first slice does not create generic tables for encounters, observations,
results, documents, EHR forms, projects, layers, assignments, learner state or
assessment. It also does not attempt a comprehensive terminology service, FHIR
representation, prescribing system or clinical data warehouse. Those choices
should be driven by the relevant learning experience rather than imposed on the
patient library prematurely.

Nothing deferred should be discarded. During each of the five imports, a
companion inventory should record the source path, original meaning, allocation,
target phase and any clinical question. That inventory is the bridge from the
prototype to later patient projects and is also evidence that clinically useful
material has not disappeared during normalization.

## Relational model

Names are proposed table names and may be refined to match established schema
conventions during implementation.

### `patient_profiles`

This is the durable asset identity.

| Field               | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| `id`                | Stable UUID.                                               |
| `scope`             | `system`, `organisation` or `user`.                        |
| `organisation_id`   | Required only for organisation-owned profiles.             |
| `user_id`           | Required only for user-owned profiles.                     |
| `slug`              | Stable human-readable identifier, unique within its owner. |
| `status`            | `active` or `archived`; publication is version-specific.   |
| `source_profile_id` | Original profile when this asset is a clone.               |
| `source_version_id` | Exact source version copied to create the clone.           |
| `created_by`        | Platform user responsible for creation or cloning.         |
| timestamps          | Creation, update and archival audit timestamps.            |

Scope and owner consistency must be enforced by database checks: system profiles
have neither owner foreign key, organisation profiles have only
`organisation_id`, and user profiles have only `user_id`. A clone is an
independent asset: source corrections never flow into it silently. Lineage
remains available for explanation and an explicit future update flow.

### `patient_profile_versions`

This is an immutable authored revision.

| Field                  | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `id`                   | Stable UUID pinned by projects and clone provenance.            |
| `patient_profile_id`   | Owning profile.                                                 |
| `version_number`       | Monotonic number unique within the profile.                     |
| `state`                | `draft`, `in_review`, `published`, `superseded` or `withdrawn`. |
| `schema_version`       | Version of the typed patient-document contract.                 |
| `document`             | Validated patient document stored as JSONB.                     |
| `content_hash`         | Detects accidental changes and supports seed verification.      |
| `change_summary`       | Human explanation of this revision.                             |
| author/reviewer fields | Who authored, reviewed and published the revision.              |
| timestamps             | Authored, reviewed and published times.                         |

Only drafts are editable. Publishing creates or promotes an immutable revision;
later corrections create another version. At most one version per profile is the
current published version. Withdrawing a version prevents new use but does not
break projects or learner history already pinned to it.

The database should enforce structural lifecycle invariants. Application
services should enforce transitions, document validation and role permissions in
one transaction. Audit events should record publication, withdrawal, archival
and clone operations.

### Search projection

The library needs indexed, non-sensitive projections such as display name,
approximate life stage, care settings, specialties and learning-relevant tags.
These should be derived from a validated version at publication, not maintained
as a second manually authored truth. PostgreSQL search and JSONB indexes are
sufficient for the first slice; a separate search service is unnecessary.

## Patient document contract

The canonical contract should be declared TypeScript-first in `packages/types`.
A Zod boundary schema must satisfy that domain type and validate every write and
seed import. Version 1 should contain:

- `schemaVersion` and an explicit `synthetic: true` marker;
- `identity`: names, preferred name, date of birth, pronouns, sex and gender
  fields where known and clinically relevant;
- `demographics`: ethnicity, faith or belief and other authored context, with
  unknown values represented explicitly rather than guessed;
- `communication`: languages, communication preferences and accessibility
  needs;
- `contact`: deliberately fictional address/contact details when educationally
  relevant;
- `relationships`: stable item IDs, names, relationship/carer roles and notes;
- `background`: stable item IDs and typed social, cultural, family, occupational,
  safeguarding and historical facts;
- `problems`, `allergies` and `baselineMedications`: stable item IDs and a small
  common clinical shape with optional specialty detail; and
- `synopsis` and classification tags for catalogue discovery.

Collection items need stable authored IDs so later project layers can target a
fact without relying on array position. Dates use ISO calendar dates; scenario
time belongs to projects. Unknown, absent and not-applicable values must remain
distinct. Free text is allowed where clinical nuance requires it, but not as a
substitute for fields needed by behavior, filtering or validation.

The JSON document must be size-limited, sanitized at rendering boundaries and
upgraded through explicit schema migrations. Uploaded media and documents should
use separate asset records and storage policies rather than embedded data URLs.

## Clone behavior

A clone should execute as one trusted service transaction:

1. authorize the actor for the selected user or organisation owner and verify
   the relevant product capability;
2. read a published, cloneable system version;
3. create a user- or organisation-owned profile with source profile and version
   lineage;
4. create draft version 1 containing a deep copy of the validated document;
5. record an audit event; and
6. return the new private draft.

RLS provides ownership and tenancy defence in depth, but entitlement and
workflow decisions belong in the service boundary. Users may access their own
profiles; tutors may read published system profiles and profiles owned by their
active organisation; platform administrators manage system profiles. Users must
not discover another user's private profiles, and organisation members must
never discover another organisation's profiles. The existing organisation
contract fields are not a sufficient capability model, so a clone flow must add
or identify a named product entitlement rather than infer permission from seat
count.

## Layer contract for the later project slice

The baseline published profile is conceptual layer zero. A patient project
version pins that profile version and owns ordered layers. Each layer has a stable
ID, label, sequence, optional narrative time marker, release configuration and a
validated list of typed operations.

Initial operations should be domain-level actions such as add, update, supersede
or remove a fact, observation, result, document or encounter record. They should
not expose raw database mutations or unrestricted JSON Patch paths. The effective
record at layer N is computed from the pinned baseline plus layers 1 through N.
This makes forward and backward navigation deterministic and prevents shared
state mutation.

Published project versions and their layers are immutable. Each assignment pins
one project version; each learner instance records its own unlocked/current
layer. Many assignments can therefore use the same project at different stages
and schedules. The initial authoring model is linear. Stable identities and an
explicit preceding layer allow later branching if a genuine learning design
requires it.

## First production catalogue

The first five imports are deliberately structurally diverse:

| Source patient  | Coverage                                 | Import emphasis                                                             |
| --------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| Adebayo Omolade | Community, diabetes, learning disability | Communication, accessibility and social context.                            |
| Adam Marsden    | Community mental health                  | Enduring history, safeguarding and separation of visits from profile truth. |
| Emma Barlow     | Paediatric palliative/supportive care    | Parent/carer relationships and advance-care context.                        |
| Amina Warsame   | Maternity and newborn care               | Pregnancy history and a related baby without embedding the whole episode.   |
| Esther Jenkins  | Acute stroke and interprofessional care  | Baseline history separated from admission and discipline-specific learning. |

Importing means clinically interpreting each prototype, not copying its
JavaScript object. Every extracted field should be traceable to the source and
classified as profile, project/layer, EHR configuration or teaching content. The
first seed includes only approved profile content; the remaining material stays
in an import inventory for later project work.

## Production seed strategy

Canonical system profiles are production content, not development fixtures. Add
a committed `supabase/seeds/production.sql` containing deterministic records with
fixed UUIDs, version numbers, timestamps and content hashes. It must not depend
on development organisations or users. The local Supabase seed configuration
should apply this file before the existing `supabase/seed.sql`, so development
receives production catalogue content plus local identities and test fixtures.

Production application of the same seed must be an explicit, documented,
repeatable operation after its schema migration. It should be safe to run twice:
existing immutable versions are left untouched, and verification fails if a
known UUID has different content rather than silently rewriting published
history. New or corrected content is introduced with new version IDs.

Database integration tests should apply the production seed twice and verify:

- exactly the expected five system profiles and published versions exist;
- their content hashes and fixed identities match;
- every document passes the current boundary schema;
- no development organisation, user or credential is created;
- cloning produces an independent organisation draft with correct lineage; and
- RLS separates system visibility, platform authoring, user ownership and
  organisation copies.

As the catalogue grows, author-friendly source fixtures plus a deterministic SQL
generation/validation command may replace hand-maintained JSON literals. The
committed SQL remains the deployable artifact until a content deployment service
exists.

## Implementation sequence

1. Confirm the patient document vocabulary and clinical approver for the five
   imports.
2. Add TypeScript domain types, Zod validation and fixture contract tests.
3. Add one new migration for profile, version, audit/search support, indexes and
   RLS policies; regenerate database types.
4. Add the production seed and local seed ordering, then integration tests for
   idempotency and isolation.
5. Build platform-admin list, view, draft, review, publish and archive services
   and UI.
6. Perform a field-by-field clinical import of the five profiles and record the
   deferred project/layer content inventory.
7. Add tutor browse and preview, then the separately entitled clone transaction.

Each vertical step should include authorization, service-contract, database and
user-flow tests. No patient project or EHR table is required to complete the
patient-profile slice.

## Decisions required before migration

1. Name the role or group responsible for clinical review and publication; the
   schema can record reviewers but cannot define the governance process.
2. Confirm whether organisation tutors can publish profiles immediately or need
   an organisation-level reviewer workflow.
3. Define the named licence capability that permits cloning.
4. Confirm whether dates of birth remain fixed fictional dates or are transformed
   to preserve age when a project starts. Fixed dates are recommended for profile
   truth; a project can present a derived age at its pinned scenario date.
5. Confirm whether safeguarding details need a restricted visibility class in
   addition to normal organisation tenancy before importing them.
