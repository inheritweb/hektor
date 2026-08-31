# Patient-profile history import inventory

Status: implementation inventory for the first five system profiles. It records
the boundary decisions applied to the current prototype revision.

The completed source-by-source reconciliation records are the authoritative
evidence of completeness and are named
`docs/patient-profile-reconciliation-<patient>.md`.

## Adebayo Omolade

Imported as patient history:

- diabetes diagnostic assessment five months before the active GP review;
- initial HbA1c and weight at diagnosis;
- learning-disability assessment and its enduring communication implications;
- baseline Activities of Living and communication assessment;
- established learning-disability nurse support; and
- commencement of metformin.

Left for the current episode: the slow-healing leg wound, current 102 kg weight,
current height record, GP attendance, current referrals and the proposed wound
review plan.

## Adam Marsden

Imported as patient history:

- the first psychotic presentation and schizophrenia diagnosis;
- the pathway through HBTT, Early Intervention in Psychosis and CMHT;
- the active enhanced-CPA plan; and
- the CGL substance-misuse referral.

Childhood trauma, bereavement and social history remain in the profile's
structured background rather than being duplicated as clinical events.

Left for the current episode: the third weekly CMHT home visit, current
deterioration, self-neglect, substance-use escalation, exploitation concern,
risk assessment and current care actions.

## Emma Barlow

Imported as patient history:

- infant AVSD repair;
- AML diagnosis, first-line chemotherapy and remission;
- recurrence and poorly responding second-line chemotherapy;
- HDU admission for PICC infection;
- the staging MRI confirming widespread extramedullary relapse;
- the established specialist oncology referral/care relationship; and
- the Children and Young People's Advance Care Plan already in progress at the
  episode boundary, including recorded goals and escalation context.

Left for the current episode: the weekly community nursing visit, its assessment
findings, actions, documentation and any changes to the advance care plan.

## Amina Warsame

Imported as patient history:

- antenatal booking and booking BMI;
- the oral glucose tolerance test and gestational-diabetes conclusion;
- transfer to consultant-led maternity care;
- the diet-controlled GDM care plan; and
- normal serial fetal-growth scans.

Left for the current episode: labour and delivery, ventouse procedure, perineal
repair, estimated blood loss, newborn observations, postnatal results,
medications, VTE plan, discharge plan and all postnatal-ward activity. These
records already exist when the learner opens the EHR, but they belong to the
active maternity episode rather than the reusable patient history.

## Esther Jenkins

Imported as patient history:

- the previous bereavement-associated depressive episode; and
- the completed two-year antidepressant course where the medicine name is not
  supplied by the source;
- historical hypertension and atrial-fibrillation diagnoses; and
- the recent pre-episode home blood-pressure observation.

The base profile also retains her pre-admission independence and home context,
handedness, GP registration, family cardiovascular history, lifestyle,
longstanding low mood and the complete reported baseline medicine/adherence
position. See `docs/patient-profile-reconciliation-esther-jenkins.md` for the
source-by-source disposition record.

Her enduring hypertension, atrial fibrillation, hyperlipidaemia and bilateral
knee osteoarthritis also remain on the current problem list.

Left for the current episode: the acute stroke presentation and admission,
stroke symptoms, current weight/height, falls and swallow risks, ward context,
investigations, observations, referrals and current care.

## Import rules applied

- The current clinical episode, not the time at which the learner opens the EHR,
  is the boundary.
- Existing summary fields remain authoritative for current problems, allergies
  and baseline medication; the five records now carry the full baseline medicine
  lists supplied by the prototype.
- No missing dates, codes, medicine names, measurements or authors were invented.
- Current-episode material remains available in the prototype for the subsequent
  EHR/current-episode slice; it has not been discarded.
