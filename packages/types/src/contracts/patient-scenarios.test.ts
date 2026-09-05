import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  PatientCareSetting,
  PatientProfileLayerCollectionPath,
  PatientProfileLayerOperationType,
  PatientProfileScope,
  PatientProfileVersionState,
} from '../patient-profiles';
import {
  PatientScenarioClinicalAudience,
  PatientScenarioStatus,
  PatientScenarioStepKind,
} from '../patient-scenarios';
import {
  createPatientScenarioDraftInputSchema,
  patientScenarioSchema,
  updatePatientScenarioDraftInputSchema,
} from './patient-scenarios';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);

describe('patient scenario contracts', () => {
  it('validates bounded draft creation input', () => {
    expect(
      createPatientScenarioDraftInputSchema.parse({
        title: ' A simple scenario ',
        slug: 'a-simple-scenario',
        description: ' A deliberately empty scenario shell. ',
        careSetting: PatientCareSetting.AcuteInpatient,
        intendedClinicalAudiences: [PatientScenarioClinicalAudience.Nursing],
        beginningStep: { title: ' Initial presentation ' },
      }),
    ).toEqual({
      title: 'A simple scenario',
      slug: 'a-simple-scenario',
      description: 'A deliberately empty scenario shell.',
      careSetting: PatientCareSetting.AcuteInpatient,
      intendedClinicalAudiences: [PatientScenarioClinicalAudience.Nursing],
      beginningStep: { title: 'Initial presentation' },
    });

    expect(
      createPatientScenarioDraftInputSchema.safeParse({
        title: 'Duplicate audience',
        slug: 'duplicate-audience',
        description: 'Invalid duplicate audience values.',
        careSetting: PatientCareSetting.AcuteInpatient,
        intendedClinicalAudiences: [
          PatientScenarioClinicalAudience.Nursing,
          PatientScenarioClinicalAudience.Nursing,
        ],
        beginningStep: { title: 'Beginning' },
      }).success,
    ).toBe(false);
  });

  it('requires concurrency and rejects identity changes when editing', () => {
    const input = {
      title: 'Updated scenario',
      slug: 'updated-scenario',
      description: 'Updated scenario metadata.',
      careSetting: PatientCareSetting.Community,
      intendedClinicalAudiences: [PatientScenarioClinicalAudience.Nursing],
      beginningStep: { title: 'Updated beginning' },
      expectedUpdatedAt: '2026-09-04T06:00:00.000Z',
    };

    expect(updatePatientScenarioDraftInputSchema.parse(input)).toEqual(input);
    expect(
      updatePatientScenarioDraftInputSchema.safeParse({
        ...input,
        patientProfileId: '37ea1fbc-d47c-4b75-b918-19af6184bb3b',
      }).success,
    ).toBe(false);
    expect(
      updatePatientScenarioDraftInputSchema.safeParse({
        ...input,
        expectedUpdatedAt: undefined,
      }).success,
    ).toBe(false);
  });

  it('validates a scenario aggregate with its patient version, steps and layers', () => {
    const document = JSON.parse(
      readFileSync(
        resolve(
          repositoryRoot,
          'supabase/seeds/patient-profiles/esther-jenkins.json',
        ),
        'utf8',
      ),
    ) as unknown;

    expect(
      patientScenarioSchema.parse({
        id: 'e1cd82e8-745b-4f25-b828-a62d98a9fc2d',
        slug: 'esther-acute-ischaemic-stroke',
        patientProfile: {
          id: '016a3ade-5634-4773-9c08-5c7984af3cec',
          patientProfileId: '37ea1fbc-d47c-4b75-b918-19af6184bb3b',
          versionNumber: 1,
          state: PatientProfileVersionState.Draft,
          schemaVersion: 1,
          document,
          contentHash: 'fixture-content-hash',
          changeSummary: 'Esther source reconciliation',
          createdAt: '2026-08-31T10:00:00.000Z',
          updatedAt: '2026-08-31T10:00:00.000Z',
        },
        scope: PatientProfileScope.System,
        title: 'Acute ischaemic stroke admission',
        description: 'Esther is admitted following a FAST-positive event.',
        careSetting: PatientCareSetting.AcuteInpatient,
        intendedClinicalAudiences: [PatientScenarioClinicalAudience.Nursing],
        status: PatientScenarioStatus.Draft,
        updatedAt: '2026-09-02T06:00:00.000Z',
        steps: [
          {
            id: '563b99e4-6af4-49e4-90b8-e16eb676d27e',
            title: 'Admission to the stroke unit',
            position: 10,
            kind: PatientScenarioStepKind.Beginning,
            patientProfileLayer: {
              id: 'a46a8867-6607-4829-8454-72631b647ab2',
              patientProfileId: '37ea1fbc-d47c-4b75-b918-19af6184bb3b',
              title: 'Acute stroke admission',
              schemaVersion: 1,
              operations: [],
            },
            ehrChanges: [],
          },
        ],
      }),
    ).toBeDefined();
  });

  it('rejects a scenario whose layer belongs to another patient', () => {
    const document = JSON.parse(
      readFileSync(
        resolve(
          repositoryRoot,
          'supabase/seeds/patient-profiles/esther-jenkins.json',
        ),
        'utf8',
      ),
    ) as unknown;
    const result = patientScenarioSchema.safeParse({
      id: 'e1cd82e8-745b-4f25-b828-a62d98a9fc2d',
      slug: 'invalid-cross-patient-scenario',
      patientProfile: {
        id: '016a3ade-5634-4773-9c08-5c7984af3cec',
        patientProfileId: '37ea1fbc-d47c-4b75-b918-19af6184bb3b',
        versionNumber: 1,
        state: PatientProfileVersionState.Draft,
        schemaVersion: 1,
        document,
        contentHash: 'fixture-content-hash',
        changeSummary: 'Fixture',
        createdAt: '2026-08-31T10:00:00.000Z',
        updatedAt: '2026-08-31T10:00:00.000Z',
      },
      scope: PatientProfileScope.System,
      title: 'Invalid scenario',
      description: 'The layer belongs to another patient.',
      careSetting: PatientCareSetting.AcuteInpatient,
      intendedClinicalAudiences: [],
      status: PatientScenarioStatus.Draft,
      updatedAt: '2026-09-02T06:00:00.000Z',
      steps: [
        {
          id: '563b99e4-6af4-49e4-90b8-e16eb676d27e',
          title: 'Beginning',
          position: 10,
          kind: PatientScenarioStepKind.Beginning,
          patientProfileLayer: {
            id: 'a46a8867-6607-4829-8454-72631b647ab2',
            patientProfileId: '82d4a277-c952-4a3d-bcb8-f40ab241adbb',
            title: 'Wrong patient',
            schemaVersion: 1,
            operations: [
              {
                operation: PatientProfileLayerOperationType.Add,
                path: PatientProfileLayerCollectionPath.Problems,
                value: {
                  id: 'problem',
                  problem: { display: 'Problem' },
                  clinicalStatus: 'active',
                },
              },
            ],
          },
          ehrChanges: [],
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
