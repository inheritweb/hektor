import { describe, expect, it } from 'vitest';

import { ActivityType, type LearnerActivityWork } from '../activities';
import type { LearningExperience } from '../learning-experiences';
import {
  activityResponseSchema,
  activitySchema,
  learnerActivityWorkSchema,
  learningExperienceSchema,
  saveActivityResponseInputSchema,
} from './learning-experiences';

const id = (value: number) =>
  `00000000-0000-4000-8000-${value.toString().padStart(12, '0')}`;

const timestamp = '2026-11-21T12:00:00.000Z';

function experienceFixture(): LearningExperience {
  const experience = { id: id(1), title: 'Planning care' };
  const scenarios = [
    { id: id(2), title: 'Esther: stroke admission' },
    { id: id(3), title: 'Second patient scenario' },
  ];
  return {
    ...experience,
    description: 'Explore two scenarios and record your work.',
    scenarios,
    activities: [
      {
        id: id(4),
        learningExperience: experience,
        type: ActivityType.CarePlan,
        title: 'Esther care plan',
        instructions: 'Create a care plan using the available record.',
        position: 10,
        scenarios: [scenarios[0]!],
      },
      {
        id: id(5),
        learningExperience: experience,
        type: ActivityType.Writing,
        title: 'Compare the patients',
        instructions: 'Reflect on the differences between these patients.',
        position: 20,
        scenarios,
      },
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function carePlanWorkFixture() {
  const experience = experienceFixture();
  const activity = experience.activities[0]!;
  const learnerExperience = {
    id: id(6),
    assignment: {
      id: id(30),
      group: { id: id(31), name: 'Demo group' },
      createdAt: timestamp,
    },
    learningExperience: activity.learningExperience,
    learner: { id: id(7), user: { id: id(8), displayName: 'Demo Learner' } },
  };
  const carePlan = {
    id: id(9),
    title: 'Esther care plan',
    learnerExperience,
    scenario: activity.scenarios[0]!,
    need: '',
    goals: [],
    interventions: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return {
    activity,
    learnerExperience,
    response: {
      id: id(10),
      activity: {
        id: activity.id,
        title: activity.title,
        type: activity.type,
        learningExperience: activity.learningExperience,
      },
      learnerExperience,
      type: ActivityType.CarePlan,
      carePlan: { id: carePlan.id, title: carePlan.title },
      revision: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    carePlan,
  } satisfies LearnerActivityWork;
}

describe('Learning Experience content', () => {
  it('accepts two scenarios and an activity that compares both', () => {
    const experience = experienceFixture();
    expect(learningExperienceSchema.parse(experience)).toEqual(experience);
  });

  it.each(['scenario', 'activity', 'position'] as const)(
    'rejects duplicate %s identities or ordering',
    (kind) => {
      const experience = experienceFixture();
      if (kind === 'scenario')
        experience.scenarios.push(experience.scenarios[0]!);
      if (kind === 'activity')
        experience.activities[1]!.id = experience.activities[0]!.id;
      if (kind === 'position') experience.activities[1]!.position = 10;
      expect(learningExperienceSchema.safeParse(experience).success).toBe(
        false,
      );
    },
  );

  it('rejects an activity owned by another experience', () => {
    const experience = experienceFixture();
    experience.activities[0]!.learningExperience = {
      id: id(20),
      title: 'Other experience',
    };
    expect(learningExperienceSchema.safeParse(experience).success).toBe(false);
  });

  it('rejects an activity referencing a scenario outside the experience', () => {
    const experience = experienceFixture();
    experience.activities[0]!.scenarios = [
      { id: id(20), title: 'Other patient' },
    ];
    expect(learningExperienceSchema.safeParse(experience).success).toBe(false);
  });

  it('requires a patient context for care plans but allows general writing', () => {
    const experience = experienceFixture();
    expect(
      activitySchema.safeParse({ ...experience.activities[0], scenarios: [] })
        .success,
    ).toBe(false);
    expect(
      activitySchema.safeParse({ ...experience.activities[1], scenarios: [] })
        .success,
    ).toBe(true);
  });

  it('rejects duplicate scenario references within an activity', () => {
    const activity = experienceFixture().activities[0]!;
    activity.scenarios.push(activity.scenarios[0]!);
    expect(activitySchema.safeParse(activity).success).toBe(false);
  });
});

describe('learner saves', () => {
  it('preserves draft writing including whitespace and clinical comparison symbols', () => {
    const input = {
      type: ActivityType.Writing,
      expectedRevision: null,
      text: '  Value < 5\n\nDraft reflection.  ',
    };
    expect(saveActivityResponseInputSchema.parse(input)).toEqual(input);
    expect(
      saveActivityResponseInputSchema.safeParse({ ...input, text: '' }).success,
    ).toBe(true);
  });

  it('accepts a partially completed clinical document', () => {
    const input = {
      type: ActivityType.CarePlan,
      expectedRevision: 1,
      scenarioId: id(2),
      carePlan: {
        title: '',
        need: '',
        goals: [''],
        interventions: [],
        evaluation: '',
      },
    };
    expect(saveActivityResponseInputSchema.parse(input)).toEqual(input);
  });

  it('requires a revision or explicit first-save marker', () => {
    const input = { type: ActivityType.Writing, text: 'Draft' };
    expect(saveActivityResponseInputSchema.safeParse(input).success).toBe(
      false,
    );
    for (const expectedRevision of [0, -1, 1.5]) {
      expect(
        saveActivityResponseInputSchema.safeParse({
          ...input,
          expectedRevision,
        }).success,
      ).toBe(false);
    }
  });

  it.each([
    'learnerExperienceId',
    'learnerMembershipId',
    'activityId',
    'carePlanId',
  ])('rejects caller-selected identity field %s', (field) => {
    expect(
      saveActivityResponseInputSchema.safeParse({
        type: ActivityType.Writing,
        expectedRevision: null,
        text: '',
        [field]: id(20),
      }).success,
    ).toBe(false);
  });

  it('bounds writing and care-plan payloads and rejects document identity injection', () => {
    expect(
      saveActivityResponseInputSchema.safeParse({
        type: ActivityType.Writing,
        expectedRevision: 1,
        text: 'x'.repeat(100_001),
      }).success,
    ).toBe(false);
    const input = {
      type: ActivityType.CarePlan,
      expectedRevision: null,
      scenarioId: id(2),
      carePlan: { title: 'Draft', need: '', goals: [], interventions: [] },
    };
    expect(
      saveActivityResponseInputSchema.safeParse({
        ...input,
        carePlan: { ...input.carePlan, id: id(20) },
      }).success,
    ).toBe(false);
    expect(
      saveActivityResponseInputSchema.safeParse({
        ...input,
        carePlan: { ...input.carePlan, goals: Array(51).fill('Goal') },
      }).success,
    ).toBe(false);
  });
});

describe('learner work consistency (not authorisation)', () => {
  it('resolves a care-plan response to the authoritative clinical document', () => {
    const work = carePlanWorkFixture();
    expect(learnerActivityWorkSchema.parse(work)).toEqual(work);
  });

  it('rejects a response discriminator that differs from its activity type', () => {
    const work = carePlanWorkFixture();
    expect(
      activityResponseSchema.safeParse({
        ...work.response,
        activity: { ...work.response.activity, type: ActivityType.Writing },
      }).success,
    ).toBe(false);
  });

  it('rejects another activity even if its type matches', () => {
    const work = carePlanWorkFixture();
    work.response.activity.id = id(20);
    expect(learnerActivityWorkSchema.safeParse(work).success).toBe(false);
  });

  it.each([
    'participation',
    'assignment',
    'membership',
    'user',
    'experience',
  ] as const)('rejects a clinical document from another %s', (kind) => {
    const work = carePlanWorkFixture();
    work.carePlan.learnerExperience = structuredClone(work.learnerExperience);
    const scope = work.carePlan.learnerExperience;
    if (kind === 'participation') scope.id = id(20);
    if (kind === 'assignment') scope.assignment.id = id(20);
    if (kind === 'membership') scope.learner.id = id(20);
    if (kind === 'user') scope.learner.user.id = id(20);
    if (kind === 'experience') scope.learningExperience.id = id(20);
    expect(learnerActivityWorkSchema.safeParse(work).success).toBe(false);
  });

  it('rejects another learner response, even when the clinical document is correct', () => {
    const work = carePlanWorkFixture();
    work.response.learnerExperience = { ...work.learnerExperience, id: id(20) };
    expect(learnerActivityWorkSchema.safeParse(work).success).toBe(false);
  });

  it('rejects a response attributed to another assignment of the same content', () => {
    const work = carePlanWorkFixture();
    work.response.learnerExperience = structuredClone(work.learnerExperience);
    work.response.learnerExperience.assignment.id = id(99);
    expect(learnerActivityWorkSchema.safeParse(work).success).toBe(false);
  });

  it('rejects a missing or unrelated care-plan document', () => {
    const work = carePlanWorkFixture();
    expect(
      learnerActivityWorkSchema.safeParse({ ...work, carePlan: undefined })
        .success,
    ).toBe(false);
    work.response.carePlan.id = id(20);
    expect(learnerActivityWorkSchema.safeParse(work).success).toBe(false);
  });

  it('rejects a care plan for a scenario outside the activity', () => {
    const work = carePlanWorkFixture();
    work.carePlan.scenario = { id: id(20), title: 'Other patient' };
    expect(learnerActivityWorkSchema.safeParse(work).success).toBe(false);
  });

  it('accepts writing work without a clinical document and rejects one attached to it', () => {
    const careWork = carePlanWorkFixture();
    const activity = experienceFixture().activities[1]!;
    const work = {
      activity,
      learnerExperience: careWork.learnerExperience,
      response: {
        id: id(11),
        type: ActivityType.Writing,
        text: '',
        revision: 1,
        activity: {
          id: activity.id,
          title: activity.title,
          type: activity.type,
          learningExperience: activity.learningExperience,
        },
        learnerExperience: careWork.learnerExperience,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };
    expect(learnerActivityWorkSchema.safeParse(work).success).toBe(true);
    expect(
      learnerActivityWorkSchema.safeParse({
        ...work,
        carePlan: careWork.carePlan,
      }).success,
    ).toBe(false);
  });
});
