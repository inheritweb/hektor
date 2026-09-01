# EHR multi-professional communication module source map

## Boundary

This module projects authored handovers and clinical notes from
`history.entries[type=clinical_document]` where `documentType` is `handover` or
`clinical_note`.

Care-team membership, referrals and plans may provide context for communication,
but they are not themselves evidence that a communication took place. Letters,
discharge summaries and other correspondence are reserved for the separate
**Documents / correspondence** module.

## Prototype reconciliation

The prototype demonstrates two distinct concerns that must remain separate:

- authored professional records, including chronological nursing and medical
  notes, ward-round entries and handovers; and
- learner activities asking the student to write a note or construct an SBAR
  handover after reviewing the EHR.

Lily Dean-Smith provides the clearest handover example: the source record
contains professional chronological entries, while the dedicated SBAR panel is
blank work for the learner. Esther Jenkins similarly provides blank session
notes and an interprofessional discussion prompt, not a pre-existing base
Patient Profile communication. Emma Barlow demonstrates MDT context, but the
membership and pending review recorded in her profile do not constitute an
authored MDT note.

The generic module follows the prototype's compact chronological clinical-note
presentation, including document type, title, author/service, date, sensitivity,
summary and full authored body.

## Current five-profile projection

None of the five current base Patient Profiles contains a durable authored
clinical note or handover. The module therefore establishes the truthful
projection and empty state without fabricating communications from other facts.

## Empty-state meaning

**No durable multi-professional clinical note or handover is recorded in this
base Patient Profile** does not mean that professionals have never communicated.
It states only that no authored communication has been imported before the
scenario boundary.

## Deferred

- current-episode and scenario-layer notes, handovers and MDT records;
- learner-authored SBAR, progress-note and escalation activities;
- countersignature, amendment and audit workflow;
- recipients, acknowledgement and task tracking; and
- structured care-team membership and professional directory data.
