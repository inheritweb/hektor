# EHR allergies, adverse reactions and alerts module source map

Status: implemented for the five current Patient Profiles.

## Generic boundary

This module presents the durable allergy record status and each authored allergy
or adverse-reaction entry. It preserves reaction, clinical status, verification
status, severity and supporting detail.

Episode warnings, risk scores, safeguarding concerns, line/device alerts and
medicine-monitoring prompts remain with their appropriate core modules. They are
not converted into durable allergy alerts.

## Prototype evidence

- **Esther Jenkins:** persistent erythromycin banner plus the Clinical History,
  Medications & Allergies reaction warning; the reaction is explicitly
  unconfirmed and may represent intolerance.
- **Adam Marsden:** the patient source records NKDA, while one rendered panel
  says “None documented”. The structured source assertion is retained as NKDA.
- **Adebayo Omolade:** NKDA is recorded but described as not formally
  re-confirmed for the visit. Visit confirmation is future clinical-entry data.
- **Amina Warsame:** NKDA appears in both the patient banner and record sidebar.
- **Emma Barlow:** no allergy status is documented and the learner is prompted
  to confirm it. This must not be represented as NKDA.

## Data-model consequence

An empty allergy array could not distinguish a positive NKDA assertion from an
unknown record. `PatientProfileDocumentV1` therefore now carries the bounded
record-level `PatientAllergyRecordStatus`:

- `known_allergies` requires at least one allergy entry;
- `no_known_drug_allergies` requires an empty allergy list; and
- `not_recorded` requires an empty allergy list and is displayed as unknown,
  never as NKDA.

The five production profile sources and the development-only James Bond fixture
have explicit statuses. The platform-admin editor maintains the invariant when
the status or allergy entries change.

## Deferred

- encounter-specific allergy reconciliation and confirmation;
- authored dates, recorder and provenance for the record-level assertion;
- non-allergy clinical alerts supplied by their respective modules; and
- learner clinical entries.
