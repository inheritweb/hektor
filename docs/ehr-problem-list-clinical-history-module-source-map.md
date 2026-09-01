# EHR problem list / clinical history module source map

## Boundary

This generic module projects durable clinical facts from the selected Patient
Profile version. It combines two related but distinct views:

- the concise problem projection in `problems`; and
- the structured pre-scenario record in `history.entries`.

It does not contain the current presentation, admission or records produced by a
scenario. Those will be supplied by Patient Profile layers and resolved into the
EHR later.

## Prototype evidence retained

Esther Jenkins' prototype repeats relevant diagnoses and history across its
clinical sections. The generic module preserves the underlying clinical
content while giving each durable fact one structured source. It retains:

- active, inactive and resolved problem status;
- onset and resolution dates where authored;
- approximate and partial historical dates;
- the type and full structured detail of historical entries;
- explicitly restricted sensitivity markers; and
- unknown or incomplete source information without invention.

## Patient Profile projection

| EHR content                        | Patient Profile source                    |
| ---------------------------------- | ----------------------------------------- |
| Problem, status and dates          | `problems[]`                              |
| Problem qualification              | `problems[].details`                      |
| Historical record summary and date | `history.entries[]` base fields           |
| Encounter detail                   | `history.entries[type=encounter]`         |
| Historical observations            | `history.entries[type=observation]`       |
| Assessments                        | `history.entries[type=assessment]`        |
| Investigations and results         | `history.entries[type=investigation]`     |
| Procedures                         | `history.entries[type=procedure]`         |
| Previous medication courses        | `history.entries[type=medication_course]` |
| Referrals                          | `history.entries[type=referral]`          |
| Documents                          | `history.entries[type=clinical_document]` |
| Historical care plans              | `history.entries[type=care_plan]`         |

Problem status determines grouping order, with source order preserved within a
status. Historical entries retain source order because partial and absent dates
cannot be safely forced into a chronology.

## Deferred

- scenario presentation and episode records;
- merging profile layers;
- role- or exercise-specific visibility;
- clinical editing, coding and validation; and
- learner-authored notes or assessments.
