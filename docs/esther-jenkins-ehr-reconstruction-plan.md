# Esther Jenkins EHR reconstruction plan

Status: reference discovery, superseded as the active delivery sequence by
`docs/ehr-generic-sections-slice-plan.md`.

## Governing decision

This plan records the source-locked Esther analysis and remains the reference
for reconstructing her eventual scenario. It no longer defines universal EHR
navigation. Hektor will preserve the prototype's clinical insight while
separating generic record sections, scenario/specialty modules, learner clinical
documentation and learning activity.

For this milestone:

- Esther's prototype page is the product specification;
- `PatientProfileDocumentV1` supplies durable patient facts;
- a scenario and its profile layers will supply admission and evolving clinical
  facts;
- learner activity state will supply entered assessments, plans, referrals and
  notes; and
- EHR configuration will supply simulated provider, care-setting and module
  identity.

Other prototype patients must be inspected to distinguish reusable record
sections from scenario-specific composition. Esther's exact section names,
ordering and fields remain authoritative only when reconstructing Esther's
authored scenario.

## Locked source

- Repository: `DNMSW/epr-unified`
- Revision: `03c7f129ee95c4d2d89f3d9cdafd291acd96a107`
- Reference page: `acute/esther-jenkins.html`
- Durable source record: `patients/esther-jenkins.js`
- Deployed review surface:
  `https://www.cle-tcw.prod.aws.manchester.ac.uk/site/UoM/FBMH/NURS/EHR/epr-unified-main/epr-unified-main/acute/esther-jenkins.html`
- Verified 31 August 2026: the deployed HTML and locked source page are
  byte-identical (`SHA-256 e6db23fff019caaefadb1de8d9c6543bb01a14c1cbebc94ff2ce90f8921dce47`).

Any deliberate departure from this source must be recorded with a reason. Valid
reasons include accessibility, responsive behaviour, security, data integrity
or a confirmed product decision. Generic application conventions are not a
sufficient reason.

## Exact EHR navigation

The reconstructed navigation retains this order and terminology:

1. **A — Patient Details**
2. **B — Presenting History & Neuro**
3. **C — History, Meds & Allergies**
4. **D — Obs & Risk Assessments**
5. **Flowsheets**
6. **E — Swallowing & Communication**
7. **F — Wellbeing & Function**
8. **G — Priorities & Planning**
9. **H — Investigations & Results**
10. **I — Social Work & Discharge Support**
11. **Referrals**
12. **Nursing Notes**

The full section headings, badges, evidence links and field labels come from the
prototype even where the compact navigation uses shortened wording.

## Data ownership map

| Prototype region                                           | Patient Profile                                                                         | Scenario / layers                                                            | Learner activity                                                        | Configuration                             |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------- |
| Training, trust and module bars                            | Patient identity only                                                                   | Scenario preview status                                                      | Session identity                                                        | Jean McFarlane Trust, Stroke Unit/module  |
| Patient banner                                             | Name, DOB, identifiers, sex/pronouns, allergy history                                   | Visit type, ward/bay, active presentation alerts                             | None                                                                    | Banner labels and provider theme          |
| A — Patient Details & Admission                            | Identity, handedness, address, GP, next of kin, occupation and home context             | Admission time/source/team/reason                                            | Assessor, programme, entry date/time                                    | IPE case notice                           |
| B — Presenting History & Neurological Assessment           | Relevant prior facts only                                                               | Onset, residual symptoms, pertinent negatives and current neurological state | FAST/neuro examination and reasoning                                    | Evidence link and field definitions       |
| C — Clinical History, Medications & Allergies              | Problems, family/lifestyle history, baseline medicines, allergies and adherence history | Medicines given or changed during the episode                                | Reconciliation notes and actions                                        | BNF evidence link                         |
| D — Observations & Risk Assessments                        | Pre-existing risk context only                                                          | Admission anthropometrics and current observations                           | NEWS2, Morse, Waterlow and MUST entries/calculations                    | Assessment definitions and scoring rules  |
| Flowsheets — Observations Trend                            | None                                                                                    | Layered observations across the simulated shift                              | None in the initial reconstruction                                      | Flowsheet layout                          |
| E — Swallowing, Nutrition & Communication                  | Baseline communication facts where relevant                                             | Post-stroke swallowing, appetite and communication presentation              | Swallow screen, SLT assessment and communication notes                  | RCSLT evidence link and screen fields     |
| F — Psychological Wellbeing & Functional Status            | Mental-health history, mood history and pre-episode function                            | Current mood and functional changes                                          | Mood, ADL/OT and assessment notes                                       | Assessment field definitions              |
| G — Patient Priorities, Understanding & Discharge Planning | Durable preferences and social context where present                                    | Esther's current ideas, concerns, expectations and understanding             | Prevention, discharge goals and person-centred plan                     | IPE discussion prompt                     |
| H — Investigations & Results                               | Relevant durable diagnoses and medicines                                                | Bloods, ECG, CT and other episode results                                    | VTE assessment, impression, differential and plan                       | Result ranges, flags and evidence prompts |
| I — Social Work: Home Circumstances & Discharge Support    | Home, carer, independence and previous-support facts                                    | Current discharge barriers and changed support needs                         | Carer, care package, finance, safeguarding and coordination assessments | IPE discussion prompt                     |
| Referrals                                                  | Durable contact/access facts used to populate referrals                                 | Episode facts relevant to a referral                                         | Referral forms and completion state                                     | Available services and form structure     |
| Nursing Notes — Sim Day Record                             | Background facts referenced in notes                                                    | Resolved record state at the note time                                       | Session notes and SBAR content                                          | Note templates and session structure      |

## Current implementation correction

The full-width shell, Jean McFarlane Trust visual identity, patient banner,
responsive rail, version-pinned loading and simulation-tools panel are useful
and remain.

The following navigation and content decisions are provisional and must be
replaced:

- the invented **Communication & relationships** top-level section;
- the invented **Problems & allergies** top-level section; and
- the proposed standalone **Baseline medications** section.

Their rendering code may be reused only inside the prototype sections where the
same facts actually occur:

- next of kin belongs in A and home/carer detail in I;
- communication belongs in E;
- problems, history, medicines and allergies belong together in C.

The Patient Profile remains the source of those facts. Its internal structure
does not determine the EHR navigation.

## Delivery sequence

Each increment must leave the navigation and visible field structure faithful to
Esther's prototype, even when a later data source is not yet implemented.

### Esther slice 1 — exact shell, navigation and sections A–C (complete)

- Replace the generic navigation with Esther's exact twelve destinations.
- Reconstruct **A — Patient Details & Admission** with the original labels,
  ordering, read-only/entered distinction, badge and IPE notice.
- Populate durable fields from Esther's Patient Profile.
- Mark admission and learner-entry fields as unavailable in a base-profile
  preview; do not invent values or remove the fields.
- Correct currently missed durable mappings such as handedness and GP practice.
- Reconstruct **C — Clinical History, Medications & Allergies**.
- Populate history, baseline medicines, allergy, family and lifestyle facts from
  Esther's Patient Profile.
- Preserve the prototype's allergy and adherence alerts, table columns,
  verification language, evidence link and reconciliation field.
- Keep episode medicines unavailable until scenario resolution exists.
- Reconstruct the complete visible field structure for **B — Presenting History
  & Neurological Assessment**, while marking scenario and learner fields by
  ownership rather than supplying invented values.

### Esther slice 2 — scenario foundation and initial presentation

- Implement the minimum `PatientScenario`, `PatientScenarioStep` and
  `PatientProfileLayer` contract/database foundation required by Esther.
- Seed Esther's initial acute-stroke presentation from the locked source.
- Resolve the base Patient Profile plus the initial layer deterministically.
- Do not add authoring or cloning UX in this slice.

### Esther slice 3 — populate section B

- Reconstruct presenting history and neurological assessment from the prototype.
- Populate pre-entered presentation facts from the resolved scenario.
- Introduce only the learner state needed by this section's assessment fields.

### Esther slice 4 — exact section D and flowsheets

- Reconstruct observations, NEWS2, Morse, Waterlow and MUST.
- Preserve prototype scoring behaviour with focused calculation tests.
- Render scenario-layer observations in the exact flowsheet structure.

### Esther slice 5 — exact sections E and F

- Reconstruct swallowing/communication and wellbeing/function separately within
  the same established EHR navigation.
- Combine Profile and resolved scenario facts only where the prototype does.
- Add the corresponding learner assessment state.

### Esther slice 6 — exact sections G, H and I

- Reconstruct planning, investigations/results and social-work/discharge support
  one section at a time.
- Preserve evidence links, safety prompts and interprofessional discussion
  points.

### Esther slice 7 — referrals and nursing notes

- Reconstruct the prototype's exact referral catalogue and form structure.
- Add session-scoped nursing notes and persistence.
- Keep learner work separate from Patient Profile and scenario content.

## Definition of complete

Esther's EHR is complete when a side-by-side review against the locked prototype
accounts for every navigation item, section, pre-populated fact, learner field,
calculation, prompt, evidence link, alert and responsive state. Each item must be
implemented or explicitly recorded as a deliberate departure.

Completion is not measured by whether all Patient Profile fields are displayed.
It is measured by whether Esther's authored EHR experience has been faithfully
reconstructed from structured Hektor data and state.
