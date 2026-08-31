# EHR UI slice 5 — baseline medications

Status: planned. This is the next bite-sized increment after Problems &
allergies.

## Outcome

Add one further read-only EHR destination: **Baseline medications**. A user can
review the medicines recorded at the patient-profile boundary, including dose,
route, frequency, indication, status and supporting notes.

## Clinical boundary

These are durable baseline medication facts from `PatientProfileDocumentV1`.
They are not an admission medicines reconciliation, inpatient prescription,
administration record or scenario-specific medication list. The UI must make
that boundary visible so a learner does not mistake profile data for a complete
current prescription chart.

Future scenario layers may add, stop, replace or clarify medicines for a
particular presentation. That later resolved EHR state will use the same visual
language but is outside this slice.

## Prototype alignment

The prototype's medication sections are dense, tabular and safety-oriented.
Before implementation, reconcile medication presentation across the five
reference patients, including incomplete drug names, adherence notes and
verification prompts. Preserve its:

- compact coded navigation;
- scan-friendly medicine table;
- clear dose, route, frequency and indication columns;
- visible free-text qualification and adherence information; and
- proximity to allergy information without duplicating the allergy record.

Improve responsive behaviour, semantics and readability while retaining the
Jean McFarlane Trust clinical theme and full-width workspace.

## In scope

- Enable section D as **Baseline medications**.
- Switch accessibly among sections A–D with correct active state and heading
  focus.
- Project every `PatientProfileDocumentV1.baselineMedications` item:
  - medication display name;
  - active or inactive status;
  - dose;
  - route;
  - frequency;
  - indication; and
  - details, including adherence or verification notes.
- Present active medicines before inactive medicines while preserving source
  order within each status group.
- Repeat the compact active-allergy safety summary inside the medication section
  when active allergies exist, while retaining the global patient-banner alert.
- Use a prototype-style table at wide widths and an equally complete stacked
  presentation where a table would be impractical.
- Show **No baseline medications recorded** for an empty array. Do not infer that
  the patient takes no medicines.
- Add Storybook states for multiple medicines, incomplete medicine details,
  empty medication data and narrow screens.

## Out of scope

- Medication editing, prescribing, administration or reconciliation.
- Typeahead medicine search or connection to dm+d/BNF services.
- Interaction checking, dose validation or clinical decision support.
- Scenario-added, newly stopped or inpatient medicines.
- Medication-course history already represented in longitudinal history.
- Problems, allergies or relationships editing.
- Learner responses, tutor access and assignment workflow.

## Data flow

```text
PatientProfileDocumentV1.baselineMedications
                         ↓ deterministic baseline projection
Version-pinned EHR section D
```

The projection remains role-neutral and introduces no stored EHR copy of the
patient-profile document.

## Acceptance criteria

- Sections A–D are operable by pointer and keyboard.
- Every baseline medication in the exact selected version is represented once.
- Dose, route, frequency, indication, status and details are never silently
  dropped; absent values are shown as **Not recorded**.
- Active-allergy context remains visible while medicines are reviewed.
- Empty data reads **No baseline medications recorded**, not **No medications**.
- Long medicine names and notes remain readable without page-level horizontal
  overflow.
- The section remains recognisably aligned with the prototype at desktop and
  narrow widths.
- Focused UI tests cover section switching, complete medication data and empty
  medication data.

## Following bite-sized slices

1. Structured clinical-history navigation and the first history view.
2. Prototype-specific clinical sections adopted one at a time after review.
