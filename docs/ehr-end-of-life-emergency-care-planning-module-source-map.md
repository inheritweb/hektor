# EHR end-of-life and emergency care planning module source map

## Boundary

This module projects authored advance, end-of-life and emergency care plans
that form part of the selected Patient Profile version. It reads only
`history.entries[type=care_plan][category=advance_and_emergency_care]`.

The explicit category prevents general care plans, such as Adam Marsden's
enhanced CPA plan or Amina Warsame's gestational-diabetes plan, from appearing
as end-of-life records merely because they share the same underlying record
shape.

## Prototype reconciliation

The prototype was reviewed first across its different presentations of this
material:

- Emma Barlow's **Death and Dying — CYPACP** supplies the closest source for the
  current five profiles. It presents planning context, priorities, agreed
  actions, emergency recommendations, ceilings of treatment and the current
  sign-off state in clearly separated clinical groups.
- Gao Zhing demonstrates a completed comfort-focused pathway with an active
  DNACPR/ReSPECT decision and escalation limits.
- Amara Osei-Bonsu demonstrates the clinically important opposite state: an
  identified advance-planning gap must not be displayed as a completed plan.
- Esther Jenkins has no base-profile advance or emergency plan. Her acute stroke
  presentation must not be used to infer one.

The generic module retains the prototype's purple advance-planning identity,
dense clinical grouping and prominent plan-status treatment. It does not copy
the specialist CYPACP page structure into every patient's EHR.

## Projection

Each categorised plan displays:

- plan title, status and sensitivity;
- planning context or identified need;
- recorded goals and priorities;
- agreed actions and emergency planning;
- the authored current review, recommendation or sign-off state; and
- occurrence, recording and author metadata where supplied.

Emma Barlow's current seeded CYPACP summary is classified as advance and
emergency care. General authored plans remain in **Care and support planning**.

## Empty-state meaning

**No durable end-of-life or emergency care plan is recorded in this base
Patient Profile** is an absence of a record. It does not assert that planning is
not indicated, that CPR should or should not be attempted, or that any treatment
ceiling exists.

## Deferred

- specialist CYPACP, ReSPECT or other jurisdiction-specific document views;
- structured resuscitation, escalation and signatory fields beyond the source
  data currently captured in the plan;
- current-episode or scenario-layer plans and later amendments;
- learner completion, review and countersignature workflow; and
- role-specific presentation.
