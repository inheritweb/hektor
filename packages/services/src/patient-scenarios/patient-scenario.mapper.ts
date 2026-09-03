import type { PatientScenario } from '@hektor/types';
import { ehrConfigurationChangeSchema } from '@hektor/types/contracts/ehr';
import {
  patientProfileDocumentV1Schema,
  patientProfileLayerOperationSchema,
} from '@hektor/types/contracts/patient-profiles';
import { patientScenarioSchema } from '@hektor/types/contracts/patient-scenarios';
import { HektorErrorCode } from '@hektor/types/contracts';
import type { Database } from '@hektor/types/database';

import { createServiceError } from '../errors';

type PatientProfileVersionRow =
  Database['public']['Tables']['patient_profile_versions']['Row'];

type PatientProfileLayerRow =
  Database['public']['Tables']['patient_profile_layers']['Row'];

type PatientScenarioRow =
  Database['public']['Tables']['patient_scenarios']['Row'];

type PatientScenarioStepRow =
  Database['public']['Tables']['patient_scenario_steps']['Row'];

export interface PatientScenarioPersistenceAggregate {
  scenario: PatientScenarioRow;
  patientProfileVersion: PatientProfileVersionRow;
  steps: Array<{
    step: PatientScenarioStepRow;
    patientProfileLayer: PatientProfileLayerRow;
  }>;
}

function present<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

export function mapPatientScenarioAggregate(
  aggregate: PatientScenarioPersistenceAggregate,
): PatientScenario {
  const { patientProfileVersion, scenario } = aggregate;

  const candidate = {
    id: scenario.id,
    slug: scenario.slug,
    patientProfile: {
      id: patientProfileVersion.id,
      patientProfileId: patientProfileVersion.patient_profile_id,
      versionNumber: patientProfileVersion.version_number,
      state: patientProfileVersion.state,
      schemaVersion: patientProfileVersion.schema_version,
      document: patientProfileDocumentV1Schema.parse(
        patientProfileVersion.document,
      ),
      contentHash: patientProfileVersion.content_hash,
      changeSummary: patientProfileVersion.change_summary,
      authoredBy: present(patientProfileVersion.authored_by),
      sourceReference: present(patientProfileVersion.source_reference),
      sourceRevision: present(patientProfileVersion.source_revision),
      reviewedBy: present(patientProfileVersion.reviewed_by),
      publishedBy: present(patientProfileVersion.published_by),
      createdAt: new Date(patientProfileVersion.created_at).toISOString(),
      updatedAt: new Date(patientProfileVersion.updated_at).toISOString(),
      submittedAt: present(patientProfileVersion.submitted_at),
      reviewedAt: present(patientProfileVersion.reviewed_at),
      publishedAt: present(patientProfileVersion.published_at),
      withdrawnAt: present(patientProfileVersion.withdrawn_at),
    },
    scope: scenario.scope,
    title: scenario.title,
    description: scenario.description,
    careSetting: scenario.care_setting,
    intendedClinicalAudiences: scenario.intended_clinical_audiences,
    status: scenario.status,
    steps: aggregate.steps
      .toSorted((left, right) => left.step.position - right.step.position)
      .map(({ patientProfileLayer, step }) => ({
        id: step.id,
        title: step.title,
        description: present(step.description),
        position: step.position,
        kind: step.kind,
        patientProfileLayer: {
          id: patientProfileLayer.id,
          patientProfileId: patientProfileLayer.patient_profile_id,
          title: patientProfileLayer.title,
          description: present(patientProfileLayer.description),
          schemaVersion: patientProfileLayer.schema_version,
          operations: patientProfileLayerOperationSchema
            .array()
            .parse(patientProfileLayer.operations),
          sourceReference: present(patientProfileLayer.source_reference),
          sourceRevision: present(patientProfileLayer.source_revision),
        },
        ehrChanges: ehrConfigurationChangeSchema
          .array()
          .parse(step.ehr_changes),
      })),
  };

  const parsed = patientScenarioSchema.safeParse(candidate);
  if (!parsed.success) {
    throw createServiceError(HektorErrorCode.InternalServerError, {
      message: 'Unable to load patient scenario',
      internalMessage: parsed.error.message,
      cause: parsed.error,
    });
  }

  return parsed.data;
}
