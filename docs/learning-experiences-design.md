# Learning experiences: design discussion

Status: agreed foundations moving into implementation, starting with API/domain
types. Captured 7 September 2026 and updated through the design discussion.
Unresolved proposals below are not implementation decisions.

The proposed implementation sequence and staging release gate are in
[staging-demo-runway.md](staging-demo-runway.md). It distinguishes prior
agreements from working choices for the first demo. The first slice is
merged in PR #3. The user authorised the next step on 22 November 2026;
assignment boundaries are the next small PR within the persistence slice.

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
- An experience contains one or more scenarios, with activities
  associated with the scenarios students are using.
- Tutors need searchable/filterable patient and scenario catalogues suitable
  for hundreds of records, plus preview and assignment to cohorts/groups.
- Cohorts represent broad year groups; smaller groups can serve varied purposes.
- Start the design with an experience containing two scenarios and an activity
  associated with each. Implementation is now authorised, beginning with types
  and proceeding through database schema, contracts and API shape.
- Activities have activity types and should eventually be configurable within
  a Learning Experience, which provides the entry into the student experience.
- Activities can involve writing outside the EHR (without extending the
  simulation), or clinical work within the simulation, such as creating a care
  plan. A care plan is a clinical document, not just an external written answer.
- Either kind of activity can be assessable or unassessed. The location and
  structure of assessment configuration remain undecided. Assessment is
  explicitly outside the current scope.
- Agreed conceptual names: `activity_type`, `activity`, and `activity_response`
  (learner work). These names do not yet prescribe tables or storage structure.
- The Learning Experience owns its activities. Each activity can reference the
  scenario or scenarios it needs, including multiple scenarios for comparative
  work. Activities are not owned by an individual scenario.
- An external writing activity's `activity_response` contains the learner's
  writing. For a care-plan activity, the response links to the clinical care-plan
  document created within the simulation.
- Once created through an activity, the care plan forms part of that patient's
  EHR whenever it is subsequently viewed within the Learning Experience. It
  persists as the scenario progresses and can be revisited and updated.
  Each learner has their own work and patient record within the experience.
  Shared group work is deferred; assigning to a group does not share responses.

## Proposals requiring agreement

- Separate task instructions from response format: reflections and essays may
  share a text editor; care plans need structured fields.
- Separate a reusable experience from its delivery to learners, so groups can
  begin the same experience on different dates.
- Support fixed, tutor-controlled or scheduled scenario progression. Sequence
  positions (10, 20, 30) are not timing. Teaching release dates and clinical
  dates in the patient record are separate concepts.
- Potentially offer suggested activities with reusable scenarios later; any
  added activities would belong to the Learning Experience.

## Conceptual reset: 21 September 2026

The next step is to identify the concepts before choosing tables or screens.
Agreed activity vocabulary:

- `activity_type` describes the supported way of working, such as external
  writing or creating a clinical care plan.
- `activity` describes a particular task, including its instructions and
  configuration; it is distinct from the learner's resulting work.
- `activity_response` names the learner's work.

Relationships still requiring agreement:

- The response/document relationship and individual learner isolation are agreed
  conceptually; storage details have not been designed.
- A reusable experience describes the work; a delivery describes its use with
  particular learners and timing. This separation remains a proposal.

Next implementation step: define the canonical TypeScript API/domain types,
then use them to develop the database schema, validation contracts and API shape.
Assessment and shared group work are outside the current scope.

### First type layer

The first implementation pass adds canonical types in
`packages/types/src/activities.ts` and
`packages/types/src/learning-experiences.ts`, exported from `@hektor/types`:

- `ActivityType` initially supports `writing` and `care_plan`. These are
  application-supported behaviours; this does not decide whether the database
  uses an enum or an activity-type catalogue.
- `Activity` contains its experience summary, instructions, ordering and scenario
  references. Type-specific authoring options remain to be defined.
- `ActivityResponse` distinguishes writing content from a care-plan document
  reference. The care plan is not duplicated into the response.
- `LearningExperience` describes the reusable content and its activities.
- `LearnerExperience` is an initial implementation proposal for identifying one
  learner's participation, scoped to their organisation membership. Responses
  reference it so repeated use need not be keyed solely by a reusable experience
  ID and user ID. Assignment, delivery and repeat-attempt rules remain open.

These types do not yet expose endpoints or change EHR behaviour. Runtime
contracts and database constraints must enforce that activity scenarios belong
to the experience, response types match their activities, and referenced care
plans belong to the same learner experience and patient. The clinical document
shape, source-content ownership/versioning and delivery relationship need to be
settled before completing the persistence layer. No assessment, submission
lifecycle or shared learner work has been added.

### Domain relationships: 26 September 2026

Domain/API types should provide useful related objects or summaries rather than
mirror database foreign keys. `Activity.learningExperience` and
`LearnerExperience.learningExperience` use `LearningExperienceSummary`, defined
as `Pick<LearningExperience, 'id' | 'title'>`. Embedding the full experience here
would recursively include its activities. Other relationships still need review
as the type layer develops; database rows and mutation inputs may use IDs where
appropriate.

### Runway slice 1: 21 November 2026

The first implementation slice now provides runtime validation for the content
and learner-work types. Activities and experiences expose scenario summaries;
responses expose activity and learner-participation summaries; a care-plan
response exposes a clinical-document reference. The work read model resolves
that reference to the document without defining a second stored copy.

Care-plan content uses the established clinical fields (need, goals,
interventions and evaluation) with a title. Empty fields are valid while saving
drafts. Writing preserves learner text. Save inputs require an explicit first
save (`expectedRevision: null`) or a positive revision and cannot select learner
or document identities. Atomic revision checks still need persistence support.

Schemas check unique activity IDs/order, scenario membership, activity ownership,
matching response types and consistent learner/document context. They do not
authorise callers or persist anything. Assignment snapshots, database constraints,
authenticated routes, EHR projection and screens remain later runway slices.

### Runway slice 2a: 22 November 2026

The implementation now distinguishes a reusable `LearningExperience` from a
`LearningExperienceAssignment`, and links each `LearnerExperience` to its
assignment. Assignment summaries expose the group and assignment date rather
than expanding the entire content tree in every response. Responses and care
plans carry this assignment identity through their learner-participation context.

The assignment contains a `LearningExperienceSnapshot`: the experience plus
its full scenario definitions, including patient versions, clinical layers,
progression steps and each scenario's starting EHR configuration. It must be
possible to resolve an assigned scenario without consulting editable source
content or a later application default. No snapshot-building or database
immutability mechanism exists yet; the types and schemas define that boundary.

For the first demo, the working choice is immediate group assignment with
recipients captured once and separate participation for every repeat assignment.
The create input accepts only experience and group IDs. The future authenticated
service must resolve the organisation, assigning member, eligible learners and
content, and enforce explicit group permissions. These choices implement the
runway proposal; they do not settle scheduling, authoring or shared work.

This PR adds no database tables, routes or browser features. Next is persistence
and its isolation/concurrency tests, followed by the authenticated API. Assessment
remains out of scope.

## Open questions

- Should scenario activities come along automatically and be enabled/disabled,
  or should tutors add activities within each experience?
- Who links tutors to cohorts/groups? What populations can tutors see, and who
  can grant permission to create teaching groups or see a whole organisation?
- Are recipients captured when assigned or updated with group membership?
- How is delivered content pinned, released and corrected?
- What constitutes completion and submission? Learner work is individual, even
  for experiences assigned to groups.
- How do inception dates, scenario offsets, deadlines and manual release work?

Next design exercise: walk through authoring, delivering and completing the
two-scenario example before committing to schema or screens.

## Deferred: assessment

Assessment and feedback design are outside the current scope. The earlier
proposal to configure assessment on an activity is retained for later discussion,
not treated as an agreement.
