import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mapPatientScenarioAggregate } from './patient-scenario.mapper';
import { createPatientScenariosService } from './patient-scenarios.service';

import {
  createIntegrationAuthClient,
  createIntegrationDatabaseClient,
} from '../testing/local-supabase';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);

const productionSeed = resolve(repositoryRoot, 'supabase/seeds/production.sql');

const scenarioId = 'e1cd82e8-745b-4f25-b828-a62d98a9fc2d';

const adminClient = createIntegrationDatabaseClient();

const createdUserIds: string[] = [];

function applyProductionSeed() {
  execFileSync(
    'docker',
    [
      'exec',
      '-i',
      'supabase_db_hektor',
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
    ],
    {
      cwd: repositoryRoot,
      input: readFileSync(productionSeed),
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
}

async function createAuthUser(platformAdmin = false) {
  const password = `Hektor-${randomUUID()}!`;
  const email = `patient-scenario-${randomUUID()}@example.com`;
  const result = await adminClient.auth.admin.createUser({
    app_metadata: platformAdmin ? { role: 'admin' } : {},
    email,
    email_confirm: true,
    password,
  });
  if (result.error) throw result.error;
  createdUserIds.push(result.data.user.id);
  return { email, password };
}

async function signedInClient(email: string, password: string) {
  const client = createIntegrationAuthClient();
  const result = await client.auth.signInWithPassword({ email, password });
  if (result.error) throw result.error;
  return client;
}

describe('patient scenario database foundation', () => {
  beforeAll(() => applyProductionSeed());

  afterAll(async () => {
    for (const userId of createdUserIds)
      await adminClient.auth.admin.deleteUser(userId);
  });

  it('loads and composes the deterministic Esther scenario', async () => {
    const scenario = await adminClient
      .from('patient_scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();
    expect(scenario.error).toBeNull();

    const version = await adminClient
      .from('patient_profile_versions')
      .select('*')
      .eq('id', scenario.data!.patient_profile_version_id)
      .single();
    const steps = await adminClient
      .from('patient_scenario_steps')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('position');
    expect(version.error).toBeNull();
    expect(steps.error).toBeNull();

    const layers = await adminClient
      .from('patient_profile_layers')
      .select('*')
      .in(
        'id',
        (steps.data ?? []).map(({ patient_profile_layer_id: id }) => id),
      );
    expect(layers.error).toBeNull();

    const aggregate = mapPatientScenarioAggregate({
      scenario: scenario.data!,
      patientProfileVersion: version.data!,
      steps: (steps.data ?? []).map((step) => ({
        step,
        patientProfileLayer: layers.data!.find(
          ({ id }) => id === step.patient_profile_layer_id,
        )!,
      })),
    });

    expect(aggregate.slug).toBe('esther-acute-ischaemic-stroke');
    expect(aggregate.patientProfile.patientProfileId).toBe(
      scenario.data!.patient_profile_id,
    );
    expect(aggregate.steps.map(({ kind }) => kind)).toEqual([
      'beginning',
      'progression',
      'progression',
    ]);
  });

  it('provides version-scoped summaries and scenario detail to the admin API layer', async () => {
    const service = createPatientScenariosService(adminClient);
    const scenarios = await service.listAdminPatientScenarios(
      '37ea1fbc-d47c-4b75-b918-19af6184bb3b',
      '016a3ade-5634-4773-9c08-5c7984af3cec',
    );

    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]?.beginningStep.title).toBe(
      'Admission to the stroke unit',
    );
    expect(
      await service.listAdminPatientScenarios(
        '37ea1fbc-d47c-4b75-b918-19af6184bb3b',
        randomUUID(),
      ),
    ).toEqual([]);

    const scenario = await service.getAdminPatientScenario(scenarioId);
    expect(scenario.patientProfile.document.identity.familyName).toBe(
      'Jenkins',
    );
    expect(scenario.steps[0]?.patientProfileLayer.operations).toHaveLength(9);

    const preview = await service.getAdminPatientScenarioResolvedRecord(
      'esther-acute-ischaemic-stroke',
    );
    expect(
      preview.patient.problems.some(
        ({ id }) => id === 'acute-ischaemic-stroke',
      ),
    ).toBe(true);
    expect(
      preview.ehr.sections.find(
        ({ id }) => id === 'standardised_assessments_and_risk_screening',
      )?.label,
    ).toBe('Presenting history and neurological assessment');
    expect(preview.context.currentStep.kind).toBe('beginning');
    expect(
      preview.patient.history.entries.some(
        ({ id }) => id === 'post-stroke-swallowing-history',
      ),
    ).toBe(false);
    expect(
      preview.patient.history.entries.some(
        ({ id }) => id === 'post-stroke-functional-wellbeing',
      ),
    ).toBe(false);

    const progressedPreview =
      await service.getAdminPatientScenarioResolvedRecord(
        'esther-acute-ischaemic-stroke',
        'fc7c473b-78cb-4b38-9e5d-06a9e17437e1',
      );
    expect(
      progressedPreview.patient.history.entries.some(
        ({ id }) => id === 'post-stroke-swallowing-history',
      ),
    ).toBe(true);
    expect(progressedPreview.context.appliedStepIds).toHaveLength(2);
    expect(
      progressedPreview.patient.history.entries.some(
        ({ id }) => id === 'post-stroke-functional-wellbeing',
      ),
    ).toBe(false);
    expect(
      progressedPreview.ehr.sections.find(
        ({ id }) => id === 'standardised_assessments_and_risk_screening',
      )?.label,
    ).toBe('Presenting history and neurological assessment');

    const reviewedRecord = await service.getAdminPatientScenarioResolvedRecord(
      'esther-acute-ischaemic-stroke',
      'ad82b43b-9649-4884-a865-4d80ccc18dc8',
    );
    expect(
      reviewedRecord.patient.history.entries.some(
        ({ id }) => id === 'post-stroke-functional-wellbeing',
      ),
    ).toBe(true);
    expect(reviewedRecord.context.appliedStepIds).toHaveLength(3);
    expect(
      reviewedRecord.ehr.sections.find(
        ({ id }) => id === 'standardised_assessments_and_risk_screening',
      )?.label,
    ).toBe('Presenting history and neurological assessment');
  });

  it('applies the production seed repeatedly without duplicating records', async () => {
    applyProductionSeed();

    const scenarios = await adminClient
      .from('patient_scenarios')
      .select('id', { count: 'exact' })
      .eq('id', scenarioId);
    const steps = await adminClient
      .from('patient_scenario_steps')
      .select('id', { count: 'exact' })
      .eq('scenario_id', scenarioId);
    const layers = await adminClient
      .from('patient_profile_layers')
      .select('id', { count: 'exact' })
      .in('id', [
        'a46a8867-6607-4829-8454-72631b647ab2',
        '8d764a79-889c-40cd-8285-c70abdc1e0ad',
        'df124cbb-07ca-4111-a593-d88125f02a4a',
      ]);

    expect(scenarios.count).toBe(1);
    expect(steps.count).toBe(3);
    expect(layers.count).toBe(3);
  });

  it('rejects a scenario version or step layer belonging to another patient', async () => {
    const otherProfile = await adminClient
      .from('patient_profiles')
      .select('id')
      .eq('slug', 'adam-marsden')
      .single();
    expect(otherProfile.error).toBeNull();
    const otherVersion = await adminClient
      .from('patient_profile_versions')
      .select('id')
      .eq('patient_profile_id', otherProfile.data!.id)
      .limit(1)
      .single();
    expect(otherVersion.error).toBeNull();

    const mismatchedScenario = await adminClient
      .from('patient_scenarios')
      .insert({
        id: randomUUID(),
        scope: 'system',
        slug: `invalid-version-${randomUUID()}`,
        patient_profile_id: '37ea1fbc-d47c-4b75-b918-19af6184bb3b',
        patient_profile_version_id: otherVersion.data!.id,
        title: 'Invalid scenario',
        description: 'This scenario must fail its patient/version constraint.',
        care_setting: 'acute_inpatient',
      });
    expect(mismatchedScenario.error).not.toBeNull();

    const otherLayerId = randomUUID();
    const otherLayer = await adminClient.from('patient_profile_layers').insert({
      id: otherLayerId,
      patient_profile_id: otherProfile.data!.id,
      title: 'Wrong patient layer',
      schema_version: 1,
      operations: [
        {
          operation: 'set',
          path: 'allergyRecordStatus',
          value: 'not_assessed',
        },
      ],
    });
    expect(otherLayer.error).toBeNull();

    const mismatchedStep = await adminClient
      .from('patient_scenario_steps')
      .insert({
        scenario_id: scenarioId,
        patient_profile_id: '37ea1fbc-d47c-4b75-b918-19af6184bb3b',
        patient_profile_layer_id: otherLayerId,
        title: 'Invalid progression',
        position: 20,
        kind: 'progression',
      });
    expect(mismatchedStep.error).not.toBeNull();

    const cleanup = await adminClient
      .from('patient_profile_layers')
      .delete()
      .eq('id', otherLayerId);
    expect(cleanup.error).toBeNull();
  });

  it('allows only platform administrators to read scenario records', async () => {
    const platformAdmin = await createAuthUser(true);
    const ordinaryUser = await createAuthUser();
    const adminAuthClient = await signedInClient(
      platformAdmin.email,
      platformAdmin.password,
    );
    const userAuthClient = await signedInClient(
      ordinaryUser.email,
      ordinaryUser.password,
    );

    for (const table of [
      'patient_scenarios',
      'patient_scenario_steps',
      'patient_profile_layers',
    ] as const) {
      const adminRead = await adminAuthClient.from(table).select('id');
      const userRead = await userAuthClient.from(table).select('id');

      expect(adminRead.error).toBeNull();
      expect(adminRead.data?.length).toBeGreaterThan(0);
      expect(userRead.error).toBeNull();
      expect(userRead.data).toEqual([]);
    }
  }, 30_000);
});
