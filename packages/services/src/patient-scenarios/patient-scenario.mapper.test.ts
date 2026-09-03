import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { Json } from '@hektor/types/database';

import {
  mapPatientScenarioAggregate,
  type PatientScenarioPersistenceAggregate,
} from './patient-scenario.mapper';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);

const timestamp = '2026-09-02T06:00:00.000Z';

interface ScenarioSeed {
  id: string;
  slug: string;
  scope: 'system';
  status: 'draft';
  title: string;
  description: string;
  careSetting: string;
  intendedClinicalAudiences: string[];
  steps: Array<{
    id: string;
    title: string;
    description: string;
    position: number;
    kind: 'beginning' | 'progression';
    patientProfileLayer: {
      id: string;
      title: string;
      description: string;
      schemaVersion: number;
      operations: Json;
      sourceReference: string;
      sourceRevision: string;
    };
    ehrChanges: Json;
  }>;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(resolve(repositoryRoot, path), 'utf8'));
}

function fixture(): PatientScenarioPersistenceAggregate {
  const seed = readJson(
    'supabase/seeds/patient-scenarios/esther-acute-ischaemic-stroke.json',
  ) as ScenarioSeed;
  const patientProfileId = '37ea1fbc-d47c-4b75-b918-19af6184bb3b';
  const patientProfileVersionId = '016a3ade-5634-4773-9c08-5c7984af3cec';

  return {
    scenario: {
      id: seed.id,
      slug: seed.slug,
      scope: seed.scope,
      status: seed.status,
      title: seed.title,
      description: seed.description,
      care_setting: seed.careSetting,
      intended_clinical_audiences: seed.intendedClinicalAudiences,
      patient_profile_id: patientProfileId,
      patient_profile_version_id: patientProfileVersionId,
      organisation_id: null,
      user_id: null,
      archived_at: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    patientProfileVersion: {
      id: patientProfileVersionId,
      patient_profile_id: patientProfileId,
      version_number: 1,
      state: 'draft',
      schema_version: 1,
      document: readJson(
        'supabase/seeds/patient-profiles/esther-jenkins.json',
      ) as Json,
      content_hash: 'fixture-content-hash',
      change_summary: 'Esther source reconciliation',
      authored_by: null,
      source_reference: null,
      source_revision: null,
      reviewed_by: null,
      published_by: null,
      submitted_at: null,
      reviewed_at: null,
      published_at: null,
      withdrawn_at: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    steps: seed.steps.map((step) => ({
      step: {
        id: step.id,
        scenario_id: seed.id,
        patient_profile_id: patientProfileId,
        patient_profile_layer_id: step.patientProfileLayer.id,
        title: step.title,
        description: step.description,
        position: step.position,
        kind: step.kind,
        ehr_changes: step.ehrChanges,
        created_at: timestamp,
        updated_at: timestamp,
      },
      patientProfileLayer: {
        id: step.patientProfileLayer.id,
        patient_profile_id: patientProfileId,
        title: step.patientProfileLayer.title,
        description: step.patientProfileLayer.description,
        schema_version: step.patientProfileLayer.schemaVersion,
        operations: step.patientProfileLayer.operations,
        source_reference: step.patientProfileLayer.sourceReference,
        source_revision: step.patientProfileLayer.sourceRevision,
        created_at: timestamp,
        updated_at: timestamp,
      },
    })),
  };
}

describe('patient scenario persistence mapper', () => {
  it('assembles database rows into the rich scenario aggregate', () => {
    const scenario = mapPatientScenarioAggregate(fixture());

    expect(scenario.patientProfile.document.identity.familyName).toBe(
      'Jenkins',
    );
    expect(scenario.steps).toHaveLength(3);
    expect(scenario.steps[0]?.patientProfileLayer.operations).toHaveLength(9);
    expect(scenario.steps[0]?.ehrChanges).toHaveLength(4);
    expect(scenario.steps[1]?.patientProfileLayer.operations).toHaveLength(1);
    expect(scenario.steps[2]?.patientProfileLayer.operations).toHaveLength(1);
    expect('patientProfileId' in scenario).toBe(false);
    expect('patientProfileLayerId' in scenario.steps[0]!).toBe(false);
  });

  it('rejects invalid JSON stored at a persistence boundary', () => {
    const aggregate = fixture();
    aggregate.steps[0]!.patientProfileLayer.operations = [
      { operation: 'invented-operation' },
    ];

    expect(() => mapPatientScenarioAggregate(aggregate)).toThrow();
  });
});
