# EHR care encounters and transitions module source map

## Boundary

This module projects completed pre-scenario encounters and referral pathways
from:

- `history.entries[type=encounter]`; and
- `history.entries[type=referral]`.

It does not create a current visit, admission, transfer, discharge or referral.
Those records will be supplied by scenario layers or learner activity.

## Prototype reconciliation

The prototype separates pre-populated encounter context from interactive
referral and discharge work. Esther's acute admission records the source of
admission, transfer to the stroke unit, admitting service and reason. Its
referral section contains learner-completed service forms. All of that belongs
to her stroke scenario rather than her base Patient Profile.

The seeded profiles provide durable examples of the generic shape:

- Adam's pathway records movement from acute assessment through home treatment,
  early intervention and community mental-health care;
- Amina's antenatal booking and transition to consultant-led maternity care;
- Emma's previous high-dependency admission and established oncology referral;
  and
- Adebayo's ongoing learning-disability nursing referral.

Esther currently has no durable encounter or referral entry at the base-profile
boundary.

## Projection

Encounter cards display encounter type, care setting, service, reason, outcome
or transition, dates, author and sensitivity. They use a compact timeline visual
in source order.

Referral cards display origin, destination, reason, status, outcome, dates,
author and sensitivity. Missing values remain explicitly **Not recorded**.

## Deferred

- scenario admissions, transfers and discharge;
- creation and submission of referrals;
- learner documentation and follow-up;
- service directories and referral routing;
- appointments and scheduling; and
- specialist handover workflows.
