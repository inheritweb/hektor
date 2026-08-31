# Esther Jenkins — patient-profile source reconciliation

Status: reference reconciliation complete against prototype revision `03c7f12`.
This establishes the process and acceptance standard to apply to the remaining
four seeded profiles.

## Boundary

The base profile represents Esther immediately before the sudden neurological
event that leads to the acute stroke admission. The event, admission and every
record produced because of them belong to a future `PatientProfileLayer` used by
a `PatientScenarioStep`.

Sources reviewed:

- `patients/esther-jenkins.js`;
- `acute/esther-jenkins.html`; and
- patient-specific programme metadata embedded in those files.

## Profile allocations

| Prototype assertion                                                                                                                                                                   | Profile location                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Name, date of birth, female sex and she/her pronouns                                                                                                                                  | `identity`                                                                    |
| Fictional address and Hektor simulation identifier                                                                                                                                    | `contact`, `identifiers`                                                      |
| White British ethnicity; faith not recorded; English language                                                                                                                         | `demographics`, `communication`                                               |
| Right-handed                                                                                                                                                                          | `background.right-handed`                                                     |
| Retired cleaner                                                                                                                                                                       | `background.retired-cleaner`                                                  |
| Widowed; previous bereavement-associated depressive episode and two-year antidepressant course                                                                                        | `background.widowed`, `problems.past-depressive-episode`, two history entries |
| Increasing low mood for several months, not previously disclosed; no hopelessness, self-harm thoughts, hallucinations or delusions                                                    | `problems.recent-low-mood`                                                    |
| Lives with daughter Tasha, aged 42, who works part-time as a receptionist and is the only local informal support; synthetic contact `07SIM000205`                                     | `relationships.tasha-jenkins`                                                 |
| Rented two-bedroom terraced home, stairs, no downstairs bathroom or toilet                                                                                                            | `background.living-with-daughter`                                             |
| Fully independent with personal care, dressing, mobility and domestic tasks before presentation; no package of care, equipment, adaptations or previous adult-social-care involvement | `background.pre-episode-independence`                                         |
| Registered with Openshaw Health Centre                                                                                                                                                | `background.gp-practice`                                                      |
| Hypertension diagnosed about ten years earlier and home BP about 160/90 in the previous month                                                                                         | `problems.hypertension`, two history entries                                  |
| Longstanding hyperlipidaemia                                                                                                                                                          | `problems.hyperlipidaemia`                                                    |
| Mild bilateral knee osteoarthritis                                                                                                                                                    | `problems.knee-osteoarthritis`                                                |
| Atrial fibrillation diagnosed about two years earlier                                                                                                                                 | `problems.atrial-fibrillation`, history assessment                            |
| Erythromycin caused diarrhoea and stomach pain many years earlier; status remains unconfirmed allergy versus intolerance                                                              | `allergies.erythromycin`                                                      |
| Amlodipine 5 mg orally once daily                                                                                                                                                     | `baselineMedications.amlodipine`                                              |
| Bisoprolol 10 mg orally once daily                                                                                                                                                    | `baselineMedications.bisoprolol`                                              |
| Unspecified statin 80 mg orally once daily; exact medicine requires reconciliation                                                                                                    | `baselineMedications.statin`                                                  |
| Apixaban 5 mg orally twice daily; evening adherence is poor and about three doses were missed in the preceding week                                                                   | `baselineMedications.apixaban`                                                |
| Naproxen, unknown dose, orally when required for knee arthritis; not used for about two months and interaction with apixaban requires review                                          | `baselineMedications.naproxen`                                                |
| Mostly ready meals; typical breakfast and lunch; occasionally cooks with Tasha                                                                                                        | `background.diet-and-activity`                                                |
| Walks for about 30 minutes once or twice monthly                                                                                                                                      | `background.diet-and-activity`                                                |
| Occasional beer with Tasha                                                                                                                                                            | `background.diet-and-activity`                                                |
| Smokes about ten cigarettes daily and has smoked since age 18; wishes to stop but is reluctant to add medication                                                                      | `background.smoking-history`                                                  |
| Mother died from stroke aged 85; sister died from heart disease aged 65; father had high cholesterol and diabetes and died in an accident aged 67                                     | `background.family-cardiovascular-history`                                    |

## Future profile-layer allocations

The following assertions are intentionally not absent or discarded. They belong
to the initial or subsequent layers of the acute-stroke scenario:

- the sudden “funny” feeling, left facial droop, slurred speech, left-arm
  weakness and water spilling from the left side of the mouth;
- the two-day timing, ED attendance, transfer to the stroke unit, admission
  date/time, ward, team and reason for admission;
- residual facial and left-arm sensory/strength changes and all episode-specific
  positive and negative neurological findings;
- current weight, height and observations;
- post-stroke dysphagia symptoms, swallow testing, communication assessment and
  dietary/fluid decisions;
- anxiety about another stroke, post-stroke appearance concerns and sleep loss
  since admission;
- new functional limitations and all current falls, skin, nutrition, VTE and
  other risk assessments;
- admission blood tests, ECG and CT results, including the acute right-MCA
  infarct and chronic small-vessel change reported during this episode;
- medicines given in hospital, reconciliation decisions and secondary
  prevention changes;
- Esther's episode-specific priorities, understanding, cancelled holiday and
  discharge questions;
- multidisciplinary contacts, referrals, care coordination, carer assessment,
  proposed equipment, adaptations, benefits and discharge support; and
- nursing notes, clinical plans and anything learners add during the exercise.

The fact that Esther had been feeling low for several months is in the profile;
the disclosure and assessment of that fact during the admission may also be
represented by a scenario layer without duplicating or rewriting the underlying
fact.

## Teaching and interface allocations

Programme/year/module labels, interprofessional prompts, evidence links,
student instructions, required-field markers, selectable assessment choices,
calculator behavior, referral forms, save/print controls and simulation-session
text areas are experience or exercise configuration. They are not patient data.

The `systems`, `programmes`, `programmeMeta`, EHR section list, alert style and
source-page navigation are likewise prototype routing or presentation metadata.

## Duplicates and normalization

- Repeated identity, diagnosis, allergy, medication and social-history text is
  represented once in the appropriate structured field.
- “AF”, “irregular rhythm” and “atrial fibrillation” describe the same problem.
- The bereavement/depression statements across the JavaScript source and EHR
  sections describe the same resolved episode.
- The social-work and psychological sections repeat pre-admission independence;
  it is represented once as background.
- The source's real-looking NHS-format number is not copied. Hektor uses the
  clearly synthetic `SIM-HKT-37194` identifier.
- Unknown medicine names, doses and dates remain explicitly unknown or
  approximate; none were inferred.

## Acceptance record

- Every patient-specific source assertion has one of the dispositions above.
- Every base-profile allocation is represented in
  `supabase/seeds/patient-profiles/esther-jenkins.json`.
- Platform admin displays identity, demographics, contact, relationships,
  background, problems, allergies, baseline medicines and structured history;
  the complete validated document remains available in its collapsed audit
  view.
- Current-presentation material is retained for the future layer import.

Esther is therefore source-complete relative to prototype revision `03c7f12`,
minus the current presentation reserved for scenario layers. This does not claim
external clinical approval; it is ready for that review.
