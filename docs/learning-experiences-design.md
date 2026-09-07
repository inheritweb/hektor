# Learning experiences: design discussion

Status: discussion, not an approved implementation plan. Captured 7 September
2026 to preserve decisions across session/container changes.

## Current implementation

Platform admins have patient profiles, the scenario catalogue, basic scenario
creation/overview editing and EHR preview. Esther's seeded stroke scenario has
three cumulative steps: admission, swallowing/communication review, and
functional/psychological review. Clinical layer and progression-step authoring
are not yet available through the scenario editor.

## Established direction

- The package of work is called a **Learning Experience**. Project and Learning
  Journey were considered; neither should introduce an extra container layer.
- Experiences may last 45 minutes, two hours or several weeks. Duration is not
  their defining characteristic.
- Add a Learning Experiences navigation destination. Provide system experiences
  and allow tutors to create their own.
- An experience contains one or more scenarios, with activities/assessments
  associated with the scenarios students are using.
- Tutors need searchable/filterable patient and scenario catalogues suitable
  for hundreds of records, plus preview and assignment to cohorts/groups.
- Cohorts represent broad year groups; smaller groups can serve varied purposes.
- Start the design with an experience containing two scenarios and an activity
  associated with each. No implementation has been authorised for this yet.

## Proposals requiring agreement

- Treat assessment as configuration of an activity rather than a separate
  content hierarchy. Question sets, care plans, reflections and essays can all
  be practice or assessed work.
- Separate task instructions from response format: reflections and essays may
  share a text editor; care plans need structured fields.
- Separate a reusable experience from its delivery to learners, so groups can
  begin the same experience on different dates.
- Support fixed, tutor-controlled or scheduled scenario progression. Sequence
  positions (10, 20, 30) are not timing. Teaching release dates and clinical
  dates in the patient record are separate concepts.
- Associate activities with the scenario's use in an experience, potentially
  offering suggested activities with reusable scenarios later.

## Open questions

- Can activities reference several scenarios, for example comparing patients?
  This determines whether activities belong to an experience with scenario
  references or are nested under one scenario inclusion.
- Should scenario activities come along automatically and be enabled/disabled,
  or should tutors add activities within each experience?
- Who links tutors to cohorts/groups? What populations can tutors see, and who
  can grant permission to create teaching groups or see a whole organisation?
- Are recipients captured when assigned or updated with group membership?
- How is delivered content pinned, released and corrected?
- What constitutes completion, submission, feedback and assessment? Are initial
  submissions individual, even for experiences assigned to groups?
- How do inception dates, scenario offsets, deadlines and manual release work?

Next design exercise: walk through authoring, delivering and completing the
two-scenario example before committing to schema or screens.
