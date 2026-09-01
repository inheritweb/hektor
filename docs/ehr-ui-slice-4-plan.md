# EHR UI slice 4 — problems and allergies

Status: implemented but superseded as EHR information architecture. Problem and
allergy rendering may be reused inside Esther's prototype-defined section C;
this invented top-level section is not a target design. See
`docs/esther-jenkins-ehr-reconstruction-plan.md`.

## Outcome

Add one further read-only EHR destination: **Problems & allergies**. A user can
review the patient's durable problem list and allergy record, including clinical
status, verification and reactions, from the exact selected profile version.

## Prototype alignment

The prototype often places clinical history, medicines and allergies close
together because they must be reviewed together in practice. This slice adopts
that clinical-safety emphasis while introducing only the two smallest related
datasets. Medicines and longitudinal history remain later increments.

Before implementation, reconcile the problem- and allergy-related presentation
across the five reference patients. Preserve the prototype's:

- compact coded navigation and information density;
- pale-blue section and table treatment;
- prominent allergy visibility in the patient banner;
- clear distinction between populated clinical facts and learner-entered work;
  and
- restrained red and amber safety cues.

Improve accessibility, responsiveness and consistency without turning the EHR
into a standard Hektor dashboard.

## In scope

- Replace the disabled section C placeholder with an enabled
  **Problems & allergies** destination.
- Switch accessibly among sections A, B and C while retaining the exact selected
  patient-profile version.
- Project every `PatientProfileDocumentV1.problems` item:
  - problem display name;
  - clinical status;
  - onset and resolution dates where recorded; and
  - details.
- Project every `PatientProfileDocumentV1.allergies` item:
  - substance;
  - clinical and verification status;
  - severity where recorded;
  - all recorded reactions; and
  - details.
- Show an allergy summary in the patient banner when active allergies exist.
- Use a conspicuous prototype-style safety panel for active allergies without
  implying that a synthetic profile is a live clinical record.
- Distinguish **No allergies recorded** from missing or unverified allergy
  information. Do not label an empty array as **No known allergies** unless the
  contract later captures that authored assertion explicitly.
- Present active, resolved and inactive problems distinctly without suppressing
  historical entries.
- Retain the full-width clinical theme, responsive navigation and simulation
  tools push panel.
- Add Storybook states for active allergy warnings, no recorded allergies,
  multiple problems and narrow screens.

## Information hierarchy

1. Patient banner allergy summary.
2. Active-allergy safety panel.
3. Allergy record with verification, reaction and severity detail.
4. Problem list, with active items before inactive or resolved items while
   retaining source order within each status group.

This ordering follows the prototype's safety emphasis. It does not alter or
persist the patient-profile document.

## Out of scope

- Adding or editing problems and allergies from the EHR.
- Baseline or current medicines.
- Longitudinal encounters, investigations, procedures, care plans or documents.
- Scenario-layer problems, current-presentation alerts or admission diagnoses.
- Drug interaction checks, terminology search or external clinical coding.
- Learner verification decisions or assessment inputs.
- Tutor access and assignment workflow.

## Data flow

```text
PatientProfileDocumentV1.problems + .allergies
                         ↓ deterministic safety projection
Version-pinned EHR section C and patient-banner summary
```

The projection remains role-neutral presentation code. Platform-admin, tutor
and learner routes will eventually provide it through their own authorization
adapters.

## Acceptance criteria

- Sections A, B and C are operable by pointer and keyboard, with correct active
  state and heading focus.
- Every problem and allergy in the exact selected version is represented once.
- Active allergy information is visible from every EHR section through the
  patient banner.
- Empty allergy data is described as **No allergies recorded**, not **No known
  allergies**.
- Unknown, unconfirmed and confirmed allergy states remain distinguishable.
- Long reactions and clinical details wrap without horizontal page overflow.
- Safety colours retain readable contrast and are not the sole carrier of
  meaning.
- Focused UI tests cover section switching, active allergy visibility and empty
  allergy data.

## Following bite-sized slices

1. Baseline medicines — planned in `docs/ehr-ui-slice-5-plan.md`.
2. Structured clinical-history navigation and the first history view.
3. Prototype-specific clinical sections adopted one at a time after review.
