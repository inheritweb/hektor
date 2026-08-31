# EHR UI slice 2 — record navigation and patient details

Status: completed. This is the first record-content increment after the
full-screen base-profile preview shell.

## Outcome

Introduce the first small piece of the EHR record beneath the existing preview
header. A user can open one active **Patient details** destination and read the
patient's stable administrative and demographic details at desktop or mobile
widths.

## Design approach

The prototype remains the interaction and information-architecture reference.
Before implementation, reconcile its record navigation, patient banner and
patient-details section across the reference patients. Preserve the hierarchy
and useful density that emerged from the prototype's clinical authoring process.
Adapt it for accessibility and responsive layouts rather than recasting it as a
generic Hektor dashboard.

The EHR deliberately has its own institutional clinical design language rather
than inheriting Hektor product branding. The initial simulated provider is
**Jean McFarlane Trust**, retained from the prototype as simulation-world
content. Provider identity and record context are explicit view-model inputs so
they can later come from EHR or scenario settings.

## In scope

- A responsive EHR record region beneath the header already implemented.
- A left record-navigation rail on wider screens.
- A compact accessible navigation control on narrow screens.
- One active navigation destination: **Patient details**.
- A deterministic patient-details projection containing:
  - name and date of birth;
  - age, sex at birth and pronouns;
  - synthetic identifiers;
  - demographics;
  - fictional address and contact information;
  - next of kin; and
  - available occupation, living-arrangement and social summaries.
- Explicit unknown/not-recorded presentation where the profile contract carries
  that distinction.
- Coexistence with the right-hand simulation-tools push panel: opening the tool
  must keep the EHR visible and usable.
- Shared UI components and Storybook states for desktop and narrow examples.

## Out of scope

- The complete relationships and communication view: languages, communication
  preferences and accessibility needs. Patient details includes only the
  prototype's compact next-of-kin field; the richer view remains a later slice.
- Problems, allergies, medicines or longitudinal clinical history.
- Scenario layers, current presentation, alerts created by a scenario or step
  navigation.
- Learner inputs, reflection, questions or care-plan work in the tools panel.
- Tutor access, assignments or learner authorization adapters.
- Persisted EHR configuration or per-profile UI configuration.
- Rebuilding all prototype sections at once.

## Data flow

```text
PatientProfileDocumentV1
        ↓ deterministic patient-details projection
Responsive EHR patient-details view
```

The projection is presentation code, not a stored EHR record. It contains no
platform-admin concepts, so later tutor and learner routes can supply the same
view model.

## Acceptance criteria

- The platform-admin CTA opens the exact displayed version at
  `/ehr/patients/{patient-slug}/version/{version-id}` in a new tab.
- Patient details show the facts from that exact profile version and introduce
  no current-presentation material.
- Desktop navigation remains visible while the record scrolls.
- Mobile navigation is keyboard and screen-reader accessible and does not force
  desktop-width overflow.
- Opening the simulation tools reduces the EHR viewport and never overlays or
  obscures the record.
- Long names and addresses wrap without breaking the header or details layout.
- The page remains explicitly marked as simulated, synthetic content.
- Focused UI tests cover the projected content and tools-panel interaction.

## Following bite-sized slices

1. Communication, accessibility and relationships.
2. Problems and allergies.
3. Baseline medicines.
4. Structured clinical-history navigation and the first history view.
5. Prototype-specific clinical sections adopted one at a time after review.
