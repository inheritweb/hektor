# EHR care and support planning module source map

## Boundary

This module projects authored, durable care and support plans from the selected
Patient Profile version. It does not construct a plan from problems,
relationships, background facts or professional assumptions.

The source is `history.entries[type=care_plan]`.

## Prototype reconciliation

The prototype's generic care-planning sections consistently organise work as a
dense clinical matrix: identified problem or need, goals, actions or
interventions, and evaluation/review. The module retains that ordering and
scan-friendly clinical visual language while using responsive stacked groups at
narrow widths.

The seeded profiles demonstrate both valid states:

- Adam Marsden, Amina Warsame and Emma Barlow have authored plans that pre-date
  the scenario boundary;
- Esther Jenkins and Adebayo Omolade do not currently have a durable base-profile
  care plan.

Esther's acute-stroke nursing, multidisciplinary and discharge planning belongs
to scenario layers and later learner activity. It must not appear in her base
preview.

Emma's CYPACP is a specialist live document with its own pages, safety states,
emergency planning and sign-off workflow. The durable summary can be represented
by the generic plan here, but a future scenario may add a specialist CYPACP
section rather than flattening that document into the generic layout.

## Projection

Each plan displays:

- summary and optional details;
- status and sensitivity;
- identified need;
- goals;
- planned interventions and support;
- evaluation, or an explicit absence;
- occurrence and recorded dates; and
- recorded author or service.

Source order is preserved. Empty goal or intervention arrays are stated
explicitly rather than silently omitted.

## Empty-state meaning

**No durable care or support plan is recorded in this base Patient Profile** does
not mean that the person has no care needs, that planning is unnecessary, or
that the eventual scenario has no care-planning work.

## Deferred

- scenario and current-episode plans;
- profile-layer resolution;
- learner care-plan authoring and submission;
- approval, review and multidisciplinary workflow; and
- role- or activity-specific visibility.
