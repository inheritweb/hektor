import { readFileSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EhrConfigurationChangeType,
  type EhrConfiguration,
  EhrSectionType,
  PatientCareSetting,
  PatientClinicalStatus,
  PatientDataSensitivity,
  PatientHistoricalEncounterType,
  PatientHistoryEntryType,
  type PatientProfileDocumentV1,
  type PatientProfileLayer,
  PatientProfileLayerCollectionPath,
  PatientProfileLayerOperationType,
  PatientProfileScope,
  PatientProfileVersionState,
  type PatientScenario,
  PatientScenarioClinicalAudience,
  type PatientScenarioStep,
  PatientScenarioStatus,
  PatientScenarioStepKind,
} from '@hektor/types';
import { describe, expect, it } from 'vitest';

import {
  PatientScenarioResolutionError,
  PatientScenarioResolutionErrorCode,
  resolvePatientScenarioStep,
} from './patient-scenario-resolver';

const repositoryRoot = resolvePath(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);

const identifiers = {
  patientProfileId: '37ea1fbc-d47c-4b75-b918-19af6184bb3b',
  patientProfileVersionId: '016a3ade-5634-4773-9c08-5c7984af3cec',
  scenarioId: 'e1cd82e8-745b-4f25-b828-a62d98a9fc2d',
  beginningStepId: '563b99e4-6af4-49e4-90b8-e16eb676d27e',
  progressionStepId: '79c56a3a-561c-4c09-bcb3-363430911c1f',
  beginningLayerId: 'a46a8867-6607-4829-8454-72631b647ab2',
  progressionLayerId: '8b8ad17d-4ba8-426d-934c-42b834674e01',
};

function readEstherProfile(): PatientProfileDocumentV1 {
  return JSON.parse(
    readFileSync(
      resolvePath(
        repositoryRoot,
        'supabase/seeds/patient-profiles/esther-jenkins.json',
      ),
      'utf8',
    ),
  ) as PatientProfileDocumentV1;
}

const baseEhr: EhrConfiguration = {
  sections: [
    {
      id: 'demographics',
      type: EhrSectionType.DemographicAndAdministrative,
      order: 10,
    },
    {
      id: 'clinical-history',
      type: EhrSectionType.ProblemListAndClinicalHistory,
      order: 20,
    },
  ],
};

const beginningLayer: PatientProfileLayer = {
  id: identifiers.beginningLayerId,
  patientProfileId: identifiers.patientProfileId,
  title: 'Acute stroke admission',
  schemaVersion: 1,
  operations: [
    {
      operation: PatientProfileLayerOperationType.Add,
      path: PatientProfileLayerCollectionPath.Problems,
      value: {
        id: 'acute-ischaemic-stroke',
        problem: { display: 'Acute right-MCA ischaemic stroke' },
        clinicalStatus: PatientClinicalStatus.Active,
        onsetDate: '2026-07-17',
      },
    },
    {
      operation: PatientProfileLayerOperationType.Add,
      path: PatientProfileLayerCollectionPath.HistoryEntries,
      value: {
        id: 'acute-stroke-admission',
        type: PatientHistoryEntryType.Encounter,
        encounterType: PatientHistoricalEncounterType.Admission,
        careSetting: PatientCareSetting.AcuteInpatient,
        service: 'Stroke Unit',
        summary: 'Admitted following a FAST-positive neurological event.',
        sensitivity: PatientDataSensitivity.Standard,
      },
    },
  ],
};

const progressionLayer: PatientProfileLayer = {
  id: identifiers.progressionLayerId,
  patientProfileId: identifiers.patientProfileId,
  title: 'Swallowing concerns',
  schemaVersion: 1,
  operations: [
    {
      operation: PatientProfileLayerOperationType.Replace,
      path: PatientProfileLayerCollectionPath.Problems,
      itemId: 'acute-ischaemic-stroke',
      value: {
        id: 'acute-ischaemic-stroke',
        problem: { display: 'Acute right-MCA ischaemic stroke' },
        clinicalStatus: PatientClinicalStatus.Active,
        onsetDate: '2026-07-17',
        details: 'Post-stroke swallowing concerns require assessment.',
      },
    },
  ],
};

const steps: PatientScenarioStep[] = [
  {
    id: identifiers.beginningStepId,
    title: 'Admission to the stroke unit',
    position: 10,
    kind: PatientScenarioStepKind.Beginning,
    patientProfileLayer: beginningLayer,
    ehrChanges: [
      {
        operation: EhrConfigurationChangeType.Insert,
        section: {
          id: 'acute-presentation',
          type: EhrSectionType.CareEncountersAndTransitions,
          order: 15,
          label: 'Acute stroke presentation',
        },
      },
    ],
  },
  {
    id: identifiers.progressionStepId,
    title: 'Swallowing concerns',
    position: 20,
    kind: PatientScenarioStepKind.Progression,
    patientProfileLayer: progressionLayer,
    ehrChanges: [
      {
        operation: EhrConfigurationChangeType.Hide,
        sectionId: 'clinical-history',
      },
      {
        operation: EhrConfigurationChangeType.Configure,
        sectionId: 'acute-presentation',
        label: 'Stroke admission and swallowing',
      },
    ],
  },
];

const scenario: PatientScenario = {
  id: identifiers.scenarioId,
  slug: 'esther-acute-ischaemic-stroke',
  patientProfile: {
    id: identifiers.patientProfileVersionId,
    patientProfileId: identifiers.patientProfileId,
    versionNumber: 1,
    state: PatientProfileVersionState.Draft,
    schemaVersion: 1,
    document: readEstherProfile(),
    contentHash: 'fixture-content-hash',
    changeSummary: 'Esther source reconciliation',
    createdAt: '2026-08-31T10:00:00.000Z',
    updatedAt: '2026-08-31T10:00:00.000Z',
  },
  scope: PatientProfileScope.System,
  title: 'Acute ischaemic stroke admission',
  description: 'Esther is admitted following a FAST-positive event.',
  careSetting: PatientCareSetting.AcuteInpatient,
  intendedClinicalAudiences: [
    PatientScenarioClinicalAudience.Nursing,
    PatientScenarioClinicalAudience.Medicine,
  ],
  status: PatientScenarioStatus.Draft,
  steps,
};

function resolveScenario(selectedStepId: string) {
  return resolvePatientScenarioStep({
    baseEhr,
    scenario,
    selectedStepId,
  });
}

describe('resolvePatientScenarioStep', () => {
  it('applies only the beginning layer at the first step', () => {
    const result = resolveScenario(identifiers.beginningStepId);

    expect(result.patient.problems).toContainEqual(
      expect.objectContaining({ id: 'acute-ischaemic-stroke' }),
    );
    expect(
      result.patient.problems.find(({ id }) => id === 'acute-ischaemic-stroke'),
    ).not.toHaveProperty('details');
    expect(result.ehr.sections.map(({ id }) => id)).toEqual([
      'demographics',
      'acute-presentation',
      'clinical-history',
    ]);
    expect(result.context).toMatchObject({
      currentStep: { id: identifiers.beginningStepId },
      nextStep: { id: identifiers.progressionStepId },
      appliedLayerIds: [identifiers.beginningLayerId],
    });
  });

  it('accumulates layers and EHR changes through the selected step', () => {
    const originalScenario = structuredClone(scenario);

    const result = resolvePatientScenarioStep({
      baseEhr,
      scenario: { ...scenario, steps: [...steps].reverse() },
      selectedStepId: identifiers.progressionStepId,
    });

    expect(
      result.patient.problems.find(({ id }) => id === 'acute-ischaemic-stroke'),
    ).toHaveProperty(
      'details',
      'Post-stroke swallowing concerns require assessment.',
    );
    expect(result.ehr.sections.map(({ id }) => id)).toEqual([
      'demographics',
      'acute-presentation',
    ]);
    expect(result.ehr.sections[1]).toHaveProperty(
      'label',
      'Stroke admission and swallowing',
    );
    expect(result.context.appliedStepIds).toEqual([
      identifiers.beginningStepId,
      identifiers.progressionStepId,
    ]);
    expect(scenario).toEqual(originalScenario);
  });

  it('resolves backwards from the base without retaining later changes', () => {
    resolveScenario(identifiers.progressionStepId);
    const beginning = resolveScenario(identifiers.beginningStepId);

    expect(
      beginning.patient.problems.find(
        ({ id }) => id === 'acute-ischaemic-stroke',
      ),
    ).not.toHaveProperty('details');
    expect(beginning.ehr.sections.map(({ id }) => id)).toContain(
      'clinical-history',
    );
  });

  it('rejects a layer belonging to another patient', () => {
    const wrongPatientSteps: PatientScenarioStep[] = [
      {
        ...steps[0]!,
        patientProfileLayer: {
          ...beginningLayer,
          patientProfileId: 'baafecda-0807-4daf-a152-64984243f82c',
        },
      },
      steps[1]!,
    ];

    expect(() =>
      resolvePatientScenarioStep({
        baseEhr,
        scenario: { ...scenario, steps: wrongPatientSteps },
        selectedStepId: identifiers.beginningStepId,
      }),
    ).toThrowError(
      expect.objectContaining({
        code: PatientScenarioResolutionErrorCode.CrossPatientLayer,
      }) as PatientScenarioResolutionError,
    );
  });

  it('rejects missing replacement targets', () => {
    const invalidLayer: PatientProfileLayer = {
      ...progressionLayer,
      operations: [
        {
          operation: PatientProfileLayerOperationType.Replace,
          path: PatientProfileLayerCollectionPath.Problems,
          itemId: 'missing-problem',
          value: {
            id: 'acute-ischaemic-stroke',
            problem: { display: 'Acute right-MCA ischaemic stroke' },
            clinicalStatus: PatientClinicalStatus.Active,
          },
        },
      ],
    };

    expect(() =>
      resolvePatientScenarioStep({
        baseEhr,
        scenario: {
          ...scenario,
          steps: [
            steps[0]!,
            { ...steps[1]!, patientProfileLayer: invalidLayer },
          ],
        },
        selectedStepId: identifiers.progressionStepId,
      }),
    ).toThrowError(
      expect.objectContaining({
        code: PatientScenarioResolutionErrorCode.InvalidLayerOperation,
      }) as PatientScenarioResolutionError,
    );
  });

  it('rejects a sequence without exactly one first beginning step', () => {
    const invalidSteps = steps.map((step) => ({
      ...step,
      kind: PatientScenarioStepKind.Progression,
    }));

    expect(() =>
      resolvePatientScenarioStep({
        baseEhr,
        scenario: { ...scenario, steps: invalidSteps },
        selectedStepId: identifiers.beginningStepId,
      }),
    ).toThrowError(
      expect.objectContaining({
        code: PatientScenarioResolutionErrorCode.InvalidStepSequence,
      }) as PatientScenarioResolutionError,
    );
  });
});
