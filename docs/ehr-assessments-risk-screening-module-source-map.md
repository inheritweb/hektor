# EHR standardised assessments and risk screening module source map

## Boundary

This module displays completed, structured assessments that exist before the
scenario boundary. The base Patient Profile supplies them through historical
assessment entries with a score, scale or authored components.

Diagnostic assessments without those structured characteristics remain in
**Problem list / clinical history**. They are not relabelled as standardised
screens.

## Prototype reconciliation

The Esther Jenkins prototype contains NEWS2, Morse, Waterlow, MUST, VTE and
swallow assessments. These relate to her acute stroke presentation and are
therefore scenario-layer data, learner activity state or both. They must not be
invented in the base-profile preview.

Other Patient Profiles may contain a genuine pre-scenario structured assessment,
such as a baseline activities and communication assessment. Those records can
appear here without requiring a scenario.

## Patient Profile projection

The projection selects `history.entries[type=assessment]` when at least one of
the following is authored:

- `score`;
- `scale`; or
- one or more `components`.

The module displays the assessment name, summary, score/scale, components,
outcome, occurrence date, recorded date and author where available. Source order
is preserved.

## Empty-state meaning

**No standardised assessments or risk screens are recorded in this base Patient
Profile** does not mean that screening was completed, that the patient has no
risk, or that a scenario contains no assessments. It describes only the selected
base-profile version.

## Deferred

- scenario and current-episode assessments;
- assessment definitions, questions and scoring engines;
- learner entry, validation and persistence;
- automatic risk inference from profile facts; and
- role- or activity-specific visibility.
