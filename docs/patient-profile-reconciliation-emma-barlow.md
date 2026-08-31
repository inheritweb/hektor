# Emma Barlow — patient-profile source reconciliation

Status: source reconciliation complete against prototype revision `03c7f12`.

## Boundary and sources

The profile represents Emma before the current weekly community-nursing visit.
Reviewed `patients/emma-barlow.js` and `acute/emma-barlow.html` in full.

## Profile allocations

- Identity, fictional address, synthetic identifier, unknown ethnicity/faith
  and English language are structured data.
- Down syndrome with mild–moderate learning disability, direct communication,
  Nadine's support, Makaton/symbol cards, calm/familiar communication and known
  distress triggers are communication/accessibility data.
- Nadine is mother, sole carer/guardian/next of kin and sole holder of parental
  responsibility with synthetic telephone details; uncle Adam is emergency
  backup. Best-interest decision-making and Emma's evolving participation are
  retained as restricted family background.
- School absence/isolation, personality, interests, comfort objects, family
  support and financial/emotional pressure are structured background.
- Down syndrome, AML and repaired AVSD with a monitored leak are active
  problems; no allergy is documented.
- Tapentadol, amitriptyline, paracetamol, bisacodyl and lactulose with reported
  doses/frequencies/indications are baseline medicines.
- Infant AVSD repair; AML diagnosis aged five; first-line chemotherapy and
  remission; relapse and poorly responding second-line chemotherapy; cardiac
  complications; HDU admission for PICC infection; staging MRI showing
  widespread extramedullary relapse; oncology relationship; active MDT; and the
  in-progress CYPACP are typed history/background data.
- The CYPACP retains recorded comfort, home-care, family-involvement and
  communication goals, escalation principles and its unsigned/in-progress
  status without pretending unresolved DNACPR/ReSPECT decisions are complete.

## Future profile-layer allocations

The current home visit, current assessment and PICC check, pain/PEWS/FLACC/STAMP
findings, current intake/elimination/mobility/sleep/distress, visit-specific
medication confirmation, new actions/referrals, changes to the CYPACP and any
acute deterioration belong to scenario layers. Subsequent MDT decisions,
treatment ceilings or signed emergency recommendations are later layers when
introduced.

## Teaching/interface and normalization

NMC prompts, evidence links, scale controls, CYPACP student fields, reflection,
referral forms, EHR navigation and learner documentation are experience
content. Repeated oncology/ACP/social text is normalized. Unknown chemotherapy
agents and dates remain unknown or approximate; the source NHS-format identifier
is replaced by the synthetic Hektor identifier.

## Acceptance record

Every patient-specific assertion has a disposition; every base allocation is
represented and displayed; current-visit content is retained for layers. Emma
is source-complete relative to revision `03c7f12`, pending external clinical
review.
