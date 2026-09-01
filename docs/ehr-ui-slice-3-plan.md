# EHR UI slice 3 — communication and relationships

Status: implemented but superseded as EHR information architecture. The
communication and relationship projections may be reused inside Esther's
prototype-defined sections A, E and I; this invented top-level section is not a
target design. See `docs/esther-jenkins-ehr-reconstruction-plan.md`.

## Outcome

Add one further read-only EHR destination: **Communication & relationships**. A
user can move between sections A and B and understand how to communicate with
the patient, what adjustments are required, and who is involved in their life
and care.

## Prototype alignment

The original prototype remains the clinical UX reference. Before implementation,
reconcile the communication-, accessibility- and relationship-related content
across the five reference patients and record where each durable fact appears in
the new view. Preserve the prototype's:

- compact, coded record navigation;
- dense read-only field treatment;
- pale-blue clinical section headers and cards;
- prominent warnings where an adjustment could affect safe communication; and
- Jean McFarlane Trust simulation identity.

Improve semantics, keyboard operation, responsive behaviour and consistency
where the prototype's static HTML cannot provide them. The EHR remains a themed
Hektor subsystem, but it must not inherit the ordinary Hektor dashboard look.

## In scope

- Enable section B in the existing record-navigation rail as
  **Communication & relationships**.
- Switch between Patient details and Communication & relationships without
  reloading or losing the exact selected profile version.
- Keep the selected destination evident through `aria-current`, focus treatment
  and prototype-style active navigation.
- Use a compact horizontal section navigator at narrow widths.
- Project the following `PatientProfileDocumentV1` data:
  - languages and proficiency;
  - preferred language;
  - interpreter requirement, including unknown status;
  - communication preferences;
  - accessibility needs;
  - every recorded relationship;
  - relationship roles, contact details and notes.
- Present clinically significant communication or accessibility adjustments in
  a prototype-style information/warning panel above the ordinary fields.
- Show explicit **None recorded**, **Unknown**, **Not applicable** and
  **Not recorded** states without inventing patient facts.
- Retain full-width EHR layout, exact-version previewing and the simulation-tools
  push panel.
- Add Storybook states for rich content, no recorded needs, long relationship
  details and narrow screens.

## Interaction boundary

Section navigation is local EHR presentation state. It does not create a new
route, API or persisted record. The exact patient-profile version remains pinned
by the existing EHR URL. A section fragment may be used for deep linking if it
does not compromise keyboard navigation or browser history.

## Out of scope

- Editing communication data from the EHR.
- Problems, allergies, medicines or longitudinal clinical history.
- Current presentation, admission details or scenario-layer alerts.
- Contacting a relationship, interpreter or service.
- Learner questions, reflection or care-plan entry.
- Tutor access and assignment workflow.
- Persisted provider branding or EHR-theme settings. Jean McFarlane Trust remains
  an explicit view-model input until a concrete configuration slice is planned.

## Data flow

```text
PatientProfileDocumentV1
        ↓ deterministic communication-and-relationships projection
Version-pinned EHR section B
```

The projection remains independent of platform-admin concepts so the same EHR
page can later be supplied by tutor and learner authorization adapters.

## Acceptance criteria

- Sections A and B are operable with pointer and keyboard input.
- Only the chosen section is presented as active, and its heading receives
  appropriate focus after a user-initiated change.
- Every language, preference, accessibility need and relationship in the exact
  selected version is represented once.
- Preferred language and interpreter requirements are unambiguous.
- Important adjustments are visible before the detailed lists without being
  styled as real-patient emergency alerts.
- Empty and unknown values are distinguished correctly.
- Long notes, contact details and multiple relationships wrap without horizontal
  page overflow.
- The desktop rail and mobile navigator retain the prototype's clinical look and
  remain usable while the simulation-tools panel is open.
- Focused UI tests cover section switching, empty data and rich data.

## Following bite-sized slices

1. Problems and allergies — planned in `docs/ehr-ui-slice-4-plan.md`.
2. Baseline medicines.
3. Structured clinical-history navigation and the first history view.
4. Prototype-specific clinical sections adopted one at a time after review.
