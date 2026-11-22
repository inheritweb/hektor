import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { ActivityType } from '../activities';
import { defaultPatientProfileEhrConfiguration } from '../ehr';
import type { LearningExperienceAssignment } from '../learning-experiences';
import {
  PatientCareSetting,
  PatientProfileScope,
  PatientProfileVersionState,
} from '../patient-profiles';
import {
  PatientScenarioStatus,
  PatientScenarioStepKind,
} from '../patient-scenarios';
import { patientProfileDocumentV1Schema } from './patient-profiles';
import {
  createLearningExperienceAssignmentInputSchema,
  learnerExperienceSchema,
  learningExperienceAssignmentSchema,
  learningExperienceSnapshotSchema,
} from './learning-experiences';

const id = (value: number) =>
  `00000000-0000-4000-8000-${value.toString().padStart(12, '0')}`;

const timestamp = '2026-11-22T12:00:00.000Z';

const document = patientProfileDocumentV1Schema.parse(
  JSON.parse(
    readFileSync(
      new URL(
        '../../../../supabase/seeds/patient-profiles/esther-jenkins.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ),
);

function assignmentFixture(): LearningExperienceAssignment {
  const experience = { id: id(1), title: 'Planning care' };
  const references = [
    { id: id(2), title: 'First scenario' },
    { id: id(3), title: 'Second scenario' },
  ];
  return {
    id: id(4),
    organisation: { id: id(5), name: 'Demo organisation' },
    group: { id: id(6), name: 'Demo group' },
    assignedBy: { id: id(7), user: { id: id(8), displayName: 'Demo tutor' } },
    createdAt: timestamp,
    snapshot: {
      experience: {
        ...experience,
        description: 'Test assignment with two scenario definitions.',
        scenarios: references,
        activities: references.map((scenario, index) => ({
          id: id(10 + index),
          learningExperience: experience,
          title: index === 0 ? 'Care plan' : 'Reflection',
          type: index === 0 ? ActivityType.CarePlan : ActivityType.Writing,
          instructions: 'Record your work.',
          position: (index + 1) * 10,
          scenarios: [scenario],
        })),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      scenarios: references.map((reference, index) => ({
        baseEhr: structuredClone(defaultPatientProfileEhrConfiguration),
        scenario: {
          ...reference,
          slug: `scenario-${index}`,
          description:
            'Synthetic test scenario using the existing Esther fixture.',
          scope: PatientProfileScope.System,
          careSetting: PatientCareSetting.AcuteInpatient,
          intendedClinicalAudiences: [],
          status: PatientScenarioStatus.Published,
          updatedAt: timestamp,
          patientProfile: {
            id: id(20),
            patientProfileId: id(21),
            versionNumber: 1,
            state: PatientProfileVersionState.Published,
            schemaVersion: 1,
            document: structuredClone(document),
            contentHash: 'fixture-content-hash',
            changeSummary: 'Test fixture',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
          steps: [
            {
              id: id(30 + index),
              title: 'Beginning',
              position: 10,
              kind: PatientScenarioStepKind.Beginning,
              patientProfileLayer: {
                id: id(40 + index),
                patientProfileId: id(21),
                title: 'Initial layer',
                schemaVersion: 1,
                operations: [],
              },
              ehrChanges: [],
            },
          ],
        },
      })),
    },
  };
}

describe('assignment content boundaries', () => {
  it('includes full clinical definitions and the starting EHR for two activities', () => {
    const assignment = assignmentFixture();
    expect(learningExperienceAssignmentSchema.parse(assignment)).toEqual(
      assignment,
    );
  });

  it.each(['missing', 'extra', 'duplicate', 'unrelated'] as const)(
    'rejects %s scenario definitions',
    (kind) => {
      const snapshot = assignmentFixture().snapshot;
      if (kind === 'missing') snapshot.scenarios.pop();
      if (kind === 'extra') {
        const extra = structuredClone(snapshot.scenarios[0]!);
        extra.scenario.id = id(99);
        snapshot.scenarios.push(extra);
      }
      if (kind === 'duplicate')
        snapshot.scenarios[1] = structuredClone(snapshot.scenarios[0]!);
      if (kind === 'unrelated') snapshot.scenarios[1]!.scenario.id = id(99);
      expect(learningExperienceSnapshotSchema.safeParse(snapshot).success).toBe(
        false,
      );
    },
  );

  it.each(['experience', 'scenario', 'activityScenario'] as const)(
    'rejects a stale %s title in captured references',
    (kind) => {
      const snapshot = assignmentFixture().snapshot;
      if (kind === 'experience')
        snapshot.experience.activities[0]!.learningExperience.title = 'Stale';
      if (kind === 'scenario')
        snapshot.experience.scenarios[0] = { id: id(2), title: 'Stale' };
      if (kind === 'activityScenario')
        snapshot.experience.activities[0]!.scenarios = [
          { id: id(2), title: 'Stale' },
        ];
      expect(learningExperienceSnapshotSchema.safeParse(snapshot).success).toBe(
        false,
      );
    },
  );

  it.each(['baseEhr', 'patientProfile', 'steps'] as const)(
    'rejects a snapshot missing %s instead of falling back to live content',
    (field) => {
      const snapshot = assignmentFixture().snapshot;
      const captured = snapshot.scenarios[0]!;
      const broken =
        field === 'baseEhr'
          ? { ...captured, baseEhr: undefined }
          : {
              ...captured,
              scenario: { ...captured.scenario, [field]: undefined },
            };
      expect(
        learningExperienceSnapshotSchema.safeParse({
          ...snapshot,
          scenarios: [broken, snapshot.scenarios[1]],
        }).success,
      ).toBe(false);
    },
  );

  it('rejects ambiguous step identities within a captured scenario', () => {
    const snapshot = assignmentFixture().snapshot;
    const steps = snapshot.scenarios[0]!.scenario.steps;
    steps.push({
      ...structuredClone(steps[0]!),
      kind: PatientScenarioStepKind.Progression,
      position: 20,
    });
    expect(learningExperienceSnapshotSchema.safeParse(snapshot).success).toBe(
      false,
    );
  });
});

describe('assignment and recipient identities', () => {
  it('accepts only the source experience and target group in assignment input', () => {
    const input = { experienceId: id(1), groupId: id(6) };
    expect(createLearningExperienceAssignmentInputSchema.parse(input)).toEqual(
      input,
    );
  });

  it.each([
    'organisationId',
    'assignedBy',
    'recipients',
    'snapshot',
    'createdAt',
  ])('rejects caller-controlled %s', (field) => {
    expect(
      createLearningExperienceAssignmentInputSchema.safeParse({
        experienceId: id(1),
        groupId: id(6),
        [field]: 'client value',
      }).success,
    ).toBe(false);
  });

  it('requires an assignment relationship for individual participation', () => {
    const learner = {
      id: id(50),
      user: { id: id(51), displayName: 'Demo learner' },
    };
    const participation = {
      id: id(52),
      learningExperience: { id: id(1), title: 'Planning care' },
      learner,
      createdAt: timestamp,
    };
    expect(learnerExperienceSchema.safeParse(participation).success).toBe(
      false,
    );
    const assignment = {
      id: id(4),
      group: { id: id(6), name: 'Demo group' },
      createdAt: timestamp,
    };
    expect(
      learnerExperienceSchema.parse({ ...participation, assignment })
        .assignment,
    ).toEqual(assignment);
  });
});
