# EHR safeguarding module source map

## Boundary

This module projects explicitly authored safeguarding facts from
`background[category=safeguarding]` in the selected Patient Profile version.

It does not derive safeguarding status from problems, relationships, social
history, adversity, risk factors, care setting or the catalogue's discovery
tags. Those sources can provide important context, but treating them as a
safeguarding conclusion would change their clinical meaning.

## Prototype reconciliation

The prototype was reviewed across several distinct safeguarding states:

- Adam Marsden's **Safeguarding & Capacity** section separates existing
  vulnerability context from the learner's current assessment of self-neglect,
  exploitation and household risk.
- Mia Jones demonstrates an established Early Help plan, police-attendance
  history and active multi-agency safeguarding record.
- Gao Zhing demonstrates a concern about possible institutional neglect with a
  safeguarding referral already made.
- Lucija Hagan demonstrates welfare needs that require supportive family
  assessment without asserting abuse or neglect.
- Esther Jenkins has no authored base-profile safeguarding record.

The generic module adopts the prototype's prominent purple restricted-record
treatment. It intentionally excludes the prototype's learner assessment fields
and referral controls from a passive Patient Profile preview.

## Current five-profile projection

Adam Marsden has one durable safeguarding fact: cannabis-related debts may make
him vulnerable to exploitation. His current self-neglect, deteriorating mental
state, household impact, safeguarding assessment and referral decision belong
to a later scenario layer.

The other four current base profiles have no explicitly authored safeguarding
fact. Their module therefore shows an absence-of-record state rather than “no
concerns.”

## Empty-state meaning

**No durable safeguarding information is recorded in this base Patient
Profile** does not assert that a safeguarding assessment has taken place, that
no concern exists, or that a scenario contains no safeguarding activity.

## Deferred

- structured concern type, subject, status, level and review dates;
- safeguarding plans, referrals and multi-agency chronology;
- current-scenario assessment and escalation decisions;
- capacity, consent and best-interest decision workflows; and
- learner documentation or referral submission.
