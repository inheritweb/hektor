# EHR composition foundation slice plan

Status: proposed next slice.

## Outcome

Establish the reusable EHR abstraction: an EHR is an ordered composition of
controlled section instances. Each of the five Patient Profiles currently in
Hektor uses the same complete core-module composition when previewed without a
scenario. Its sections are populated from the selected profile's own data.

The existing prototype remains evidence for the content and behaviour within
sections. No single prototype patient's navigation defines the abstraction.
Scenarios and profession-specific views are future consumers of this EHR
structure, not part of the current slice.

## Prototype-first module discovery

Every module slice begins with the existing prototype, even when its equivalent
content is named, grouped or positioned differently there.

The required discovery sequence is:

1. Start with Esther Jenkins and inventory every prototype panel and field that
   may contribute to the module.
2. Map each item to a durable Patient Profile fact, future current-presentation
   fact, learner clinical entry, learning activity or deliberate omission.
3. Review the other four profiles currently in Hektor for structural variation
   before fixing the generic module boundary.
4. Consult the wider 27-patient corpus where the five do not exercise an
   important variation.
5. Reuse the prototype's clinically considered labels, relationships, warnings
   and interaction patterns unless there is an explicit reason to improve them.
6. Record deliberate departures made for consistency, accessibility,
   responsiveness, safety or the agreed generic abstraction.

The generic catalogue controls where content belongs in Hektor. It must not
cause clinically useful prototype content to be overlooked merely because the
prototype used a patient-specific section name.

## Core section catalogue

Every base Patient Profile EHR contains these thirteen core modules:

1. Demographic and administrative
2. About me (personalised context)
3. Allergies, adverse reactions and alerts
4. Medications / medicines optimisation
5. Problem list / clinical history
6. Standardised assessments and risk screening
7. Care and support planning
8. Observations, investigations and procedures
9. Care encounters and transitions
10. End-of-life and emergency care planning
11. Safeguarding
12. Multi-professional communication
13. Documents / correspondence

The source review indicates that all 27 prototype patients contain data capable
of driving all thirteen modules. This slice applies the abstraction to the five
profiles already imported. Importing and reconciling the remaining 22 profiles
is separate work.

“GP Record” and “Referrals” are useful views of core content, not additional
universal modules:

- chronological GP consultations are a filtered presentation within **Care
  encounters and transitions**; and
- referrals are represented across **Care encounters and transitions** and
  **Documents / correspondence**, with referral authoring added later as a
  clinical workflow.

## Base composition contract

Add a small canonical contract in the types package. Use string enums and
bounded types.

```ts
enum EhrSectionType {
  DemographicAndAdministrative = 'demographic_and_administrative',
  AboutMe = 'about_me',
  AllergiesAdverseReactionsAndAlerts = 'allergies_adverse_reactions_and_alerts',
  MedicationsAndMedicinesOptimisation = 'medications_and_medicines_optimisation',
  ProblemListAndClinicalHistory = 'problem_list_and_clinical_history',
  StandardisedAssessmentsAndRiskScreening = 'standardised_assessments_and_risk_screening',
  CareAndSupportPlanning = 'care_and_support_planning',
  ObservationsInvestigationsAndProcedures = 'observations_investigations_and_procedures',
  CareEncountersAndTransitions = 'care_encounters_and_transitions',
  EndOfLifeAndEmergencyCarePlanning = 'end_of_life_and_emergency_care_planning',
  Safeguarding = 'safeguarding',
  MultiProfessionalCommunication = 'multi_professional_communication',
  DocumentsAndCorrespondence = 'documents_and_correspondence',
}

interface EhrSectionConfiguration {
  id: string;
  type: EhrSectionType;
  order: number;
  label?: string;
}

interface EhrConfiguration {
  sections: EhrSectionConfiguration[];
}
```

`id` identifies a particular section instance. `type` selects controlled
behaviour and a renderer. They are separate because a future EHR may contain two
configured instances of the same type. Do not use array position as identity.

The section registry owns the default label, renderer and supported bounded
options for each enum member. Configuration cannot contain arbitrary component
names, HTML, executable schemas or `Record<string, unknown>` escape hatches.

## Ordering

The default configuration uses sparse integer order values:

```text
10, 20, 30, 40, ... 130
```

A future composition can insert a section at 15, 25 or 35 without rewriting the
existing configuration. Resolution sorts first by `order`, then by stable `id`
as a deterministic tie-break. Authoring validation should warn about duplicate
order values, but resolution must remain deterministic if they occur.

Order values are persistence and composition data, not visible sequence
numbers. A later authoring GUI can implement drag-and-drop by assigning an
integer between neighbouring sections. If no integer remains, it can rebalance
the draft composition before publication. Published configurations remain
immutable and are never silently renumbered.

## Future compatibility constraints

The current contract should leave room for later profession-specific views and
scenario composition without implementing either:

- a clinical audience will describe a professional perspective, not a Hektor
  authorization role;
- an audience or scenario may eventually reorder or extend section instances
  using their stable IDs and sparse order values;
- a different view must not duplicate or mutate the underlying patient facts;
  and
- EHR composition changes must remain distinct from Patient Profile data
  changes.

No audience types, scenario types, overlay operations or merge precedence are
introduced in this slice. They will be designed when we reach that work with
concrete variations in hand.

## Clinical record versus learning activity

- Content a real clinician would record in an EHR remains inside the relevant
  EHR section, even when a learner enters it.
- Tutor questions, reflection, instructions, marking criteria and explanatory
  reasoning that would not form part of the clinical record belong in the
  right-hand simulation-tools panel.
- Learner clinical entries will be stored separately from Patient Profile and
  scenario source data.
- The Patient Profile supplies durable facts. Scenario layers supply current
  presentation and evolution. Neither owns learner work.

## Scope of this slice

This remains a composition-foundation slice, not thirteen simultaneous UI
rebuilds.

1. Add the section enum and canonical base-composition types.
2. Add the code-owned registry for all thirteen core section types.
3. Define the default base composition with stable IDs and orders 10–130.
4. Add a pure resolver that validates and deterministically orders a base
   composition. Cover insertion and tie-breaking in focused unit tests.
5. Refactor EHR navigation for all five profiles to render the resolved base
   composition rather than hard-coded Esther branches.
6. Fully project the first module, **Demographic and administrative**, from each
   selected Patient Profile.
7. Give the remaining twelve modules honest “section not yet rendered” states;
   do not display “no information” or invent clinical content.
8. Retain the full-screen shell, trust identity, patient banner,
   version-pinned route and push-style simulation-tools panel.

Subsequent bite-sized slices will implement one core module at a time, checking
all five current profiles. The 27-profile source corpus will verify variation
and extend the Patient Profile contract only when an actual source fact cannot
be represented.

## Explicitly out of scope

- database-persisted EHR configurations;
- all scenario, step, layer and overlay contracts or persistence;
- platform-admin composition authoring or drag-and-drop ordering;
- clinical-audience types, presets and profession-specific rendering;
- specialty/scenario modules such as Esther's neurological assessment;
- learner clinical-record persistence;
- assignment, reflection or assessment persistence;
- tutor workflows; and
- importing the remaining 22 prototype patients.

## Acceptance criteria

- Each of the five current Patient Profiles resolves the same default
  composition, using its exact selected profile version as the data source.
- The default configuration contains exactly the thirteen agreed core modules
  with stable IDs and sparse order values.
- Navigation is generated exclusively from the resolved configuration.
- Section types are controlled string-enum values registered to known
  renderers.
- The resolver is pure, deterministic and does not mutate its input.
- Focused tests demonstrate default ordering, insertion at 15 and deterministic
  handling of equal order values.
- Demographic and administrative data is rendered without scenario or learning
  fields for all five current profiles.
- Unimplemented modules do not make false assertions about absent patient data.
- Keyboard section switching, focus management and narrow layouts remain
  covered by focused component tests and stories.
- The base contract does not prematurely encode scenario or audience mechanics.
- The module has a recorded prototype-source mapping beginning with Esther and
  covering relevant variation in the other current profiles.

## Following slice

Implement **About me (personalised context)** using all five current profiles
and the wider prototype corpus to define its generic boundaries before moving
to allergies and alerts.
