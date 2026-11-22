import { z } from 'zod';

import {
  ActivityType,
  type Activity,
  type ActivityResponse,
  type ActivitySummary,
  type LearnerActivityWork,
  type SaveActivityResponseInput,
} from '../activities';
import type { LearnerCarePlan, LearnerCarePlanContent } from '../care-plans';
import type {
  CreateLearningExperienceAssignmentInput,
  LearningExperienceAssignment,
  LearningExperienceAssignmentSummary,
  LearningExperienceSnapshot,
  LearningScenarioSnapshot,
  LearnerExperience,
  LearnerExperienceSummary,
  LearningExperience,
  LearningExperienceSummary,
  LearningScenarioSummary,
} from '../learning-experiences';
import { ehrConfigurationSchema } from './ehr';
import { patientScenarioSchema } from './patient-scenarios';
import { userSummarySchema } from './users';

const titleSchema = z.string().trim().min(1).max(200);

function requireUnique(
  values: (string | number)[],
  context: z.RefinementCtx,
  path: (string | number)[],
) {
  if (new Set(values).size !== values.length) {
    context.addIssue({
      code: 'custom',
      message: 'Values must be unique',
      path,
    });
  }
}

export const learningScenarioSummarySchema = z.strictObject({
  id: z.uuid(),
  title: titleSchema,
}) satisfies z.ZodType<LearningScenarioSummary>;

export const learningExperienceSummarySchema = z.strictObject({
  id: z.uuid(),
  title: titleSchema,
}) satisfies z.ZodType<LearningExperienceSummary>;

const membershipIdentitySchema = z.strictObject({
  id: z.uuid(),
  user: userSummarySchema,
});

export const learningExperienceAssignmentSummarySchema = z.strictObject({
  id: z.uuid(),
  group: z.strictObject({ id: z.uuid(), name: z.string().trim().min(1) }),
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<LearningExperienceAssignmentSummary>;

export const createLearningExperienceAssignmentInputSchema = z.strictObject({
  experienceId: z.uuid(),
  groupId: z.uuid(),
}) satisfies z.ZodType<CreateLearningExperienceAssignmentInput>;

export const learnerExperienceSummarySchema = z.strictObject({
  id: z.uuid(),
  learningExperience: learningExperienceSummarySchema,
  assignment: learningExperienceAssignmentSummarySchema,
  learner: membershipIdentitySchema,
}) satisfies z.ZodType<LearnerExperienceSummary>;

export const learnerExperienceSchema = learnerExperienceSummarySchema.extend({
  createdAt: z.iso.datetime(),
}) satisfies z.ZodType<LearnerExperience>;

export const activitySummarySchema = z.strictObject({
  id: z.uuid(),
  learningExperience: learningExperienceSummarySchema,
  type: z.enum(ActivityType),
  title: titleSchema,
}) satisfies z.ZodType<ActivitySummary>;

export const activitySchema = activitySummarySchema
  .extend({
    instructions: z.string().trim().min(1).max(10_000),
    position: z.number().int().min(1).max(100_000),
    scenarios: z.array(learningScenarioSummarySchema).max(100),
  })
  .superRefine((activity, context) => {
    requireUnique(
      activity.scenarios.map(({ id }) => id),
      context,
      ['scenarios'],
    );
    if (activity.type === ActivityType.CarePlan && !activity.scenarios.length) {
      context.addIssue({
        code: 'custom',
        message: 'A care-plan activity must reference a patient scenario',
        path: ['scenarios'],
      });
    }
  }) satisfies z.ZodType<Activity>;

export const learningExperienceSchema = learningExperienceSummarySchema
  .extend({
    description: z.string().trim().min(1).max(10_000),
    scenarios: z.array(learningScenarioSummarySchema).min(1).max(100),
    activities: z.array(activitySchema).min(1).max(100),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .superRefine((experience, context) => {
    const scenarioIds = experience.scenarios.map(({ id }) => id);
    requireUnique(scenarioIds, context, ['scenarios']);
    requireUnique(
      experience.activities.map(({ id }) => id),
      context,
      ['activities'],
    );
    requireUnique(
      experience.activities.map(({ position }) => position),
      context,
      ['activities'],
    );

    experience.activities.forEach((activity, index) => {
      if (activity.learningExperience.id !== experience.id) {
        context.addIssue({
          code: 'custom',
          message: 'Activity must belong to this experience',
          path: ['activities', index, 'learningExperience'],
        });
      }
      activity.scenarios.forEach((scenario, scenarioIndex) => {
        if (!scenarioIds.includes(scenario.id)) {
          context.addIssue({
            code: 'custom',
            message: 'Activity scenario must be included in this experience',
            path: ['activities', index, 'scenarios', scenarioIndex],
          });
        }
      });
    });
  }) satisfies z.ZodType<LearningExperience>;

export const learningScenarioSnapshotSchema = z
  .strictObject({
    scenario: patientScenarioSchema,
    baseEhr: ehrConfigurationSchema,
  })
  .superRefine(({ scenario, baseEhr }, context) => {
    requireUnique(
      scenario.steps.map(({ id }) => id),
      context,
      ['scenario', 'steps'],
    );
    requireUnique(
      baseEhr.sections.map(({ id }) => id),
      context,
      ['baseEhr', 'sections'],
    );
  }) satisfies z.ZodType<LearningScenarioSnapshot>;

export const learningExperienceSnapshotSchema = z
  .strictObject({
    experience: learningExperienceSchema,
    scenarios: z.array(learningScenarioSnapshotSchema).min(1).max(100),
  })
  .superRefine(({ experience, scenarios }, context) => {
    requireUnique(
      scenarios.map(({ scenario }) => scenario.id),
      context,
      ['scenarios'],
    );
    const definitions = new Map(
      scenarios.map(({ scenario }) => [scenario.id, scenario]),
    );
    if (scenarios.length !== experience.scenarios.length) {
      context.addIssue({
        code: 'custom',
        message: 'Snapshot must contain exactly the experience scenarios',
        path: ['scenarios'],
      });
    }
    experience.scenarios.forEach((reference, index) => {
      if (definitions.get(reference.id)?.title !== reference.title) {
        context.addIssue({
          code: 'custom',
          message: 'Scenario reference must match its captured definition',
          path: ['experience', 'scenarios', index],
        });
      }
    });
    experience.activities.forEach((activity, index) => {
      if (activity.learningExperience.title !== experience.title) {
        context.addIssue({
          code: 'custom',
          message: 'Activity experience title must match captured content',
          path: ['experience', 'activities', index, 'learningExperience'],
        });
      }
      activity.scenarios.forEach((reference, scenarioIndex) => {
        if (definitions.get(reference.id)?.title !== reference.title) {
          context.addIssue({
            code: 'custom',
            message: 'Activity scenario must match its captured definition',
            path: [
              'experience',
              'activities',
              index,
              'scenarios',
              scenarioIndex,
            ],
          });
        }
      });
    });
  }) satisfies z.ZodType<LearningExperienceSnapshot>;

export const learningExperienceAssignmentSchema =
  learningExperienceAssignmentSummarySchema.extend({
    organisation: z.strictObject({
      id: z.uuid(),
      name: z.string().trim().min(1),
    }),
    assignedBy: membershipIdentitySchema,
    snapshot: learningExperienceSnapshotSchema,
  }) satisfies z.ZodType<LearningExperienceAssignment>;

/** Draft content deliberately allows empty fields and preserves learner text. */
export const learnerCarePlanContentSchema = z.strictObject({
  title: z.string().max(200),
  need: z.string().max(10_000),
  goals: z.array(z.string().max(2_000)).max(50),
  interventions: z.array(z.string().max(2_000)).max(100),
  evaluation: z.string().max(10_000).optional(),
}) satisfies z.ZodType<LearnerCarePlanContent>;

export const learnerCarePlanSchema = learnerCarePlanContentSchema.extend({
  id: z.uuid(),
  learnerExperience: learnerExperienceSummarySchema,
  scenario: learningScenarioSummarySchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}) satisfies z.ZodType<LearnerCarePlan>;

const responseBaseSchema = z.strictObject({
  id: z.uuid(),
  activity: activitySummarySchema,
  learnerExperience: learnerExperienceSummarySchema,
  revision: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const activityResponseSchema = z
  .discriminatedUnion('type', [
    responseBaseSchema.extend({
      type: z.literal(ActivityType.Writing),
      text: z.string().max(100_000),
    }),
    responseBaseSchema.extend({
      type: z.literal(ActivityType.CarePlan),
      carePlan: z.strictObject({ id: z.uuid(), title: z.string().max(200) }),
    }),
  ])
  .superRefine((response, context) => {
    if (response.type !== response.activity.type) {
      context.addIssue({
        code: 'custom',
        message: 'Response type must match its activity',
        path: ['type'],
      });
    }
    if (
      response.activity.learningExperience.id !==
      response.learnerExperience.learningExperience.id
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Response activity must belong to the learner experience',
        path: ['activity'],
      });
    }
  }) satisfies z.ZodType<ActivityResponse>;

export const saveActivityResponseInputSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal(ActivityType.Writing),
    expectedRevision: z.number().int().positive().nullable(),
    text: z.string().max(100_000),
  }),
  z.strictObject({
    type: z.literal(ActivityType.CarePlan),
    expectedRevision: z.number().int().positive().nullable(),
    scenarioId: z.uuid(),
    carePlan: learnerCarePlanContentSchema,
  }),
]) satisfies z.ZodType<SaveActivityResponseInput>;

function sameLearnerExperience(
  left: LearnerExperienceSummary,
  right: LearnerExperienceSummary,
) {
  return (
    left.id === right.id &&
    left.assignment.id === right.assignment.id &&
    left.learningExperience.id === right.learningExperience.id &&
    left.learner.id === right.learner.id &&
    left.learner.user.id === right.learner.user.id
  );
}

/** Consistency validation only: services must independently authorise the caller. */
export const learnerActivityWorkSchema = z
  .strictObject({
    activity: activitySchema,
    learnerExperience: learnerExperienceSummarySchema,
    response: activityResponseSchema,
    carePlan: learnerCarePlanSchema.optional(),
  })
  .superRefine((work, context) => {
    const { activity, learnerExperience, response, carePlan } = work;
    if (
      activity.learningExperience.id !== learnerExperience.learningExperience.id
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Activity must belong to the learner experience',
        path: ['activity'],
      });
    }
    if (
      response.activity.id !== activity.id ||
      response.type !== activity.type
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Response must match the requested activity',
        path: ['response', 'activity'],
      });
    }
    if (!sameLearnerExperience(response.learnerExperience, learnerExperience)) {
      context.addIssue({
        code: 'custom',
        message: 'Response must belong to this learner participation',
        path: ['response', 'learnerExperience'],
      });
    }
    if (response.type === ActivityType.Writing) {
      if (carePlan)
        context.addIssue({
          code: 'custom',
          message: 'Writing work must not include a care-plan document',
          path: ['carePlan'],
        });
      return;
    }
    if (!carePlan || response.carePlan.id !== carePlan.id) {
      context.addIssue({
        code: 'custom',
        message: 'Care-plan response must resolve to its clinical document',
        path: ['carePlan'],
      });
      return;
    }
    if (!sameLearnerExperience(carePlan.learnerExperience, learnerExperience)) {
      context.addIssue({
        code: 'custom',
        message: 'Care plan must belong to this learner participation',
        path: ['carePlan', 'learnerExperience'],
      });
    }
    if (!activity.scenarios.some(({ id }) => id === carePlan.scenario.id)) {
      context.addIssue({
        code: 'custom',
        message:
          'Care-plan patient scenario must be referenced by the activity',
        path: ['carePlan', 'scenario'],
      });
    }
  }) satisfies z.ZodType<LearnerActivityWork>;
