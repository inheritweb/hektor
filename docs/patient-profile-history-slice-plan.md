# Patient profiles — structured history slice plan

Status: contract, five-profile import, production seed, read-only history view
and bounded platform-admin editing implemented. Formal source reconciliation is
complete for all five profiles using Esther Jenkins as the reference case.

## Outcome

Expand the patient profile from a summary of enduring facts into a reusable,
versioned longitudinal record of everything known to have happened before the
current clinical episode begins. Populate that history for the five existing
system patients from the prototype.

The evidence and disposition inventories are:

- `docs/patient-profile-reconciliation-esther-jenkins.md`;
- `docs/patient-profile-reconciliation-adam-marsden.md`;
- `docs/patient-profile-reconciliation-adebayo-omolade.md`;
- `docs/patient-profile-reconciliation-amina-warsame.md`; and
- `docs/patient-profile-reconciliation-emma-barlow.md`.

The boundary is temporal:

```text
Patient profile history        Current episode
-----------------------        ---------------
Before the episode starts      The active admission/contact/episode
Reusable with the patient      Belongs to one EHR experience
Cannot be changed by learners  May evolve through later narrative layers
```

The EHR will project both sources. It does not own the patient's past.

## Why this slice is needed

The current `clinicalRecord.facts` collection preserves useful prose but loses
the structure needed to render a convincing record. It cannot reliably express
an encounter period, a measured result and unit, an investigation status, a
medicine course, a document author or a care-plan intervention. Leaving those
records for the EHR would also make the same patient acquire a different past in
each learning experience.

This slice replaces that generic ledger in the next document schema with typed
historical entries. Existing problem, allergy and baseline-medication lists
remain concise current summaries; history entries explain how the patient
arrived at that baseline.

## In scope

- A versioned TypeScript and Zod contract for structured patient history.
- An expanded V1 patient-document TypeScript and Zod contract.
- Deterministic conversion of the existing five profile documents.
- Import of clinically relevant pre-episode history from the prototype.
- Platform-admin read and bounded editing support for the new history records.
- Clear display of history on the patient detail page.
- Validation, seed idempotency and database/service regression coverage.
- An import inventory identifying material deliberately left for the current
  episode.

## Out of scope

- The presenting complaint or encounter that starts the exercise.
- Anything that occurs during the current episode.
- Narrative layers, deterioration or staged release.
- EHR navigation and section configuration.
- Questions, teaching instructions, learner work or assessment.
- A live terminology service, FHIR server or general clinical data warehouse.
- Tutor cloning or editing of patient profiles.

## Proposed document contract

`PatientProfileDocumentV1` adds `history` and removes
`clinicalRecord.facts`. The contract has not been released, no profile version
has been published, and no learner work pins it, so a second document schema
version would add compatibility work without protecting anything. The five
current draft seed documents will be deterministically regenerated against the
revised V1 contract.

```ts
export interface PatientHistory {
  entries: PatientHistoryEntry[];
}

export type PatientHistoryEntry =
  | PatientHistoricalEncounter
  | PatientHistoricalObservation
  | PatientHistoricalAssessment
  | PatientHistoricalInvestigation
  | PatientHistoricalProcedure
  | PatientHistoricalMedicationCourse
  | PatientHistoricalReferral
  | PatientHistoricalDocument
  | PatientHistoricalCarePlan;
```

Every entry has:

- a stable authored `id`;
- a string-enum discriminator `type`;
- `summary` and optional clinically important detail;
- sensitivity (`standard` or `restricted`);
- when it happened, represented without inventing false precision;
- optional recorded date and fictional author/service attribution; and
- an optional prototype source reference for import traceability.

### Historical time

Dates must distinguish an exact day, month, year and an approximate date. An
optional end value represents a period. Unknown dates remain unknown rather than
being replaced with arbitrary dates. Ordering uses the known value but the UI
must preserve and display its precision.

### Encounter

Captures a completed admission, attendance, appointment, community contact or
other prior episode:

- encounter type and care setting;
- service or specialty;
- reason for contact;
- period and outcome/disposition; and
- optional linked entry IDs.

The encounter that begins the new learning scenario is not historical and is
excluded.

### Observation

Captures a historical measured or asserted observation:

- coded/display name;
- quantity, coded, boolean or textual value;
- unit and reference range where applicable;
- interpretation such as high, low, abnormal or normal; and
- observation time.

This covers historical vital signs, weight/BMI and other individual findings.
Calculated scores should be stored only when they are part of the authored past;
future interactive calculations belong to the EHR experience.

### Assessment

Captures a completed historical assessment or structured score:

- assessment/tool name;
- optional score and scale;
- outcome or interpretation;
- completed date; and
- optional component findings when they are educationally important.

Examples include previous risk, mental-state, falls and safeguarding
assessments.

### Investigation

Captures a completed or historically pending laboratory, imaging, microbiology,
histopathology or other investigation:

- investigation kind and coded/display name;
- status;
- requested, performed and resulted dates where known;
- overall result or report;
- structured result components with values, units, ranges and abnormal flags;
  and
- optional conclusion.

Orders and results created in the current episode are excluded.

### Procedure

Captures a previous operation, intervention or clinical procedure:

- coded/display procedure;
- performed date or period;
- indication;
- outcome and complications; and
- service or fictional performer where relevant.

### Medication course

Captures medicines taken in the past or the history of a long-term medicine:

- coded/display medicine with an optional terminology identifier;
- dose, route, frequency and indication;
- start/end time and status;
- reason started, changed or stopped; and
- relevant adherence, response or adverse-effect notes.

`baselineMedications` remains the concise list currently applicable at the
scenario boundary. A medication course can explain its earlier history without
duplicating the current baseline as a second source of truth.

### Referral

Captures a previous referral and its outcome:

- referring and receiving service;
- reason;
- requested and completed dates;
- status and outcome; and
- optional linked encounter or document IDs.

### Clinical document

Captures a historically authored record such as a clinical note, letter,
discharge summary or handover:

- bounded document type;
- title and authored date;
- fictional author name, role and service where relevant;
- structured sections or plain-text body; and
- optional linked encounter IDs.

Only authored simulation text is permitted. Markup is not stored.

### Care plan

Captures a previous patient care plan when it is part of the reusable history:

- identified need or problem;
- status and period;
- goals;
- planned interventions; and
- evaluation or outcome.

The mock care plan a learner completes belongs to their attempt, not here.

## Relationship to existing fields

- `problems` remains the current problem-list projection at the scenario
  boundary.
- `allergies` remains the current allergy projection.
- `baselineMedications` remains the current medicine-list projection.
- `background` remains social, cultural, family and personal context rather than
  becoming a container for clinical events.
- `history.entries` owns prior clinical events and records.
- `clinicalRecord.facts` is removed after its content is converted to typed
  `history.entries`; it is not retained as a parallel source of truth.

The contract will validate references and prevent duplicate IDs across all
patient-document collections. It will not require every history entry to link to
an encounter because credible source material is sometimes incomplete.

## Five-profile import

For Adebayo, Adam, Emma, Amina and Esther:

1. Inventory every clinically relevant item in the patient data file and EHR
   prototype.
2. Establish the current-episode start boundary for that source case. The
   episode may begin before the learner first sees the EHR.
3. Classify each item as profile history, current episode, learning content,
   presentation or unresolved.
4. Convert profile-history items into typed entries without inventing dates,
   values, codes or authors.
5. Preserve source references and record clinical questions.
6. Confirm that the current problem, allergy and medicine projections agree with
   the imported history.

The production seed remains deterministic and safe to apply repeatedly. The
generated SQL is derived from reviewed canonical JSON documents, not maintained
as an independent copy.

The implemented allocation decisions are recorded in
`docs/patient-profile-history-import.md`.

## Contract and seed transition

- Change the unreleased V1 TypeScript type and Zod schema directly.
- Keep `schemaVersion: 1`; the existing JSONB database guards already accept the
  revised document and no structural database migration is required.
- Regenerate the five canonical draft documents and their content hashes.
- Regenerate the production seed from those reviewed canonical documents.
- Make the seed transition deterministic and idempotent for existing development
  databases as well as clean resets.
- Remove transitional `clinicalRecord.facts` data rather than maintaining two
  history representations.

## Platform-admin UX

The detail view offers structured history cards and a clear distinction between
current summary lists and past events. Restricted history is visibly marked and
never silently omitted from the platform-admin view. Chronological sorting and
record-type filters become useful when profiles contain enough dated entries to
justify them.

The editor groups history by record type and uses bounded controls for enums,
status, sensitivity and value kind. It supports adding, editing and removing
draft entries, historical date precision and nested investigation results.

## Implementation order

1. Agree this boundary and the revised V1 TypeScript types.
2. Add Zod schemas and contract fixtures for every history entry type.
3. Build the five source inventories and reviewed V1 JSON documents.
4. Update the seed generator and deterministic draft transition.
5. Regenerate and verify the production seed.
6. Update service mapping and the platform-admin detail history view.
7. Add bounded history editing to the existing draft editor.
8. Add focused contract, service, seed and UI tests.
9. Run the repository QA report once explicitly requested for integration.

## Acceptance criteria

- The five profiles contain all clinically useful pre-episode history available
  in the prototype, or the inventory explains why an item was excluded.
- Current-episode and educational data do not enter the profile.
- Historical encounters, observations, assessments, investigations, procedures,
  medication courses, referrals, documents and care plans retain enough
  structure to drive an EHR view.
- No importer invents precision, clinical codes, values, dates or fictional
  authors absent from the source.
- Revised V1 writes, seeds and platform-admin history edits pass the same trusted
  validation boundary.
- The production seed is idempotent and contains the reviewed five revised V1
  profiles.
- The next EHR slice can render patient history without defining or duplicating
  it in an EHR-owned document.

## Review decisions

1. Confirm the nine entry types above are the smallest useful historical set.
2. Confirm the historical-time representation must support day, month, year,
   approximate values and periods.
3. Decide whether clinical documents need structured sections in V1 or whether
   bounded type plus plain text is sufficient initially.
4. Decide whether imported terminology identifiers are accepted only when the
   prototype supplies them, pending a governed terminology service.
