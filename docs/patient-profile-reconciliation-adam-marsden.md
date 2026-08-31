# Adam Marsden — patient-profile source reconciliation

Status: source reconciliation complete against prototype revision `03c7f12`.

## Boundary and sources

The profile represents Adam immediately before the current three-visit CMHT
deterioration episode. Reviewed `patients/adam-marsden.js` and
`acute/adam-marsden.html` in full.

## Profile allocations

- Identity, fictional address/telephone, synthetic Hektor identifier, White
  British ethnicity, unrecorded faith and English language are in the identity,
  contact, identifier, demographic and communication sections.
- Dyslexia, plain-language/verbal explanation and additional processing time
  are communication/accessibility needs; the associated education and school
  history is retained as restricted background.
- Sandra is next of kin with synthetic contact details; living with his mother
  and younger siblings, limited wider network and financial difficulty are
  background facts.
- Childhood domestic violence, physical abuse, paternal alcohol dependence,
  father's departure and death, school exclusion, arrest at 14, criminal-peer
  contact and probation are restricted background.
- Daily cannabis since 14, alcohol and tobacco use, historical cocaine use and
  non-engagement with CGL are restricted lifestyle/history facts.
- A paternal uncle's schizophrenia and death by suicide are restricted family
  history.
- Schizophrenia, type 2 diabetes, obesity, hypercholesterolaemia and asthma are
  active problems. No allergy is documented, represented by an empty allergy
  list rather than an invented allergy record.
- Risperidone, mirtazapine, metformin and simvastatin, including doses,
  frequencies, indications and known adherence concerns, are baseline medicines.
- First psychotic presentation at 19, diagnosis, A&E/HBTT/EIS/CMHT pathway,
  enhanced CPA and CGL referral are typed history entries.
- The established CMHT, care coordinator, support worker, consultant, review
  cadence, voluntary status and enhanced-CPA context are retained in background
  and the active historical care plan.

## Future profile-layer allocations

The current sequence of weekly home visits; increasing withdrawal, aggression,
self-neglect, cannabis/alcohol use and non-adherence; current suicidal ideation,
self-harm, delusions, hallucinations, mood, sleep, appetite and MSE; current risk
to self/others/from others; current exploitation and safeguarding decisions;
overdue metabolic observations, bloods and ECG; and all immediate referrals,
safety planning and care-plan changes belong to scenario layers.

## Teaching/interface and normalization

NMC prompts, evidence links, selectable risk/MSE fields, calculators, referral
forms, reflection questions, learner text areas, EHR navigation and save/print
controls are experience content. Repeated diagnosis, risk and social text is
normalized once. Unknown dates and results are not invented. The NHS-format
source identifier is replaced by the explicitly synthetic Hektor identifier.

## Acceptance record

Every patient-specific assertion has a disposition above; every profile
allocation is represented in the Adam seed and displayed by platform admin;
current-presentation material is retained for later scenario layers. Adam is
source-complete relative to revision `03c7f12`, pending external clinical review.
