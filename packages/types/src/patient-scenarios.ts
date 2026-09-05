import type { EhrConfiguration, EhrConfigurationChange } from './ehr';
import type {
  PatientCareSetting,
  PatientProfileDocumentV1,
  PatientProfileLayer,
  PatientProfileScope,
  PatientProfileVersion,
} from './patient-profiles';

export enum PatientScenarioStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum PatientScenarioClinicalAudience {
  Nursing = 'nursing',
  Pharmacy = 'pharmacy',
  Medicine = 'medicine',
  AlliedHealth = 'allied_health',
}

export enum PatientScenarioStepKind {
  Beginning = 'beginning',
  Progression = 'progression',
}

export interface PatientScenario {
  id: string;
  slug: string;
  patientProfile: PatientProfileVersion;
  scope: PatientProfileScope;
  title: string;
  description: string;
  careSetting: PatientCareSetting;
  intendedClinicalAudiences: PatientScenarioClinicalAudience[];
  status: PatientScenarioStatus;
  updatedAt: string;
  steps: PatientScenarioStep[];
}

export interface PatientScenarioStep {
  id: string;
  title: string;
  description?: string;
  position: number;
  kind: PatientScenarioStepKind;
  patientProfileLayer: PatientProfileLayer;
  ehrChanges: EhrConfigurationChange[];
}

export interface PatientScenarioSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  careSetting: PatientCareSetting;
  intendedClinicalAudiences: PatientScenarioClinicalAudience[];
  status: PatientScenarioStatus;
  patientProfileVersion: {
    id: string;
    versionNumber: number;
  };
  beginningStep: {
    id: string;
    title: string;
  };
}

export interface CreatePatientScenarioDraftInput {
  title: string;
  slug: string;
  description: string;
  careSetting: PatientCareSetting;
  intendedClinicalAudiences: PatientScenarioClinicalAudience[];
  beginningStep: {
    title: string;
    description?: string;
  };
}

export interface UpdatePatientScenarioDraftInput extends CreatePatientScenarioDraftInput {
  expectedUpdatedAt: string;
}

export interface ResolvedPatientScenarioStep {
  patient: PatientProfileDocumentV1;
  ehr: EhrConfiguration;
  context: {
    scenario: PatientScenario;
    currentStep: PatientScenarioStep;
    previousStep?: PatientScenarioStep;
    nextStep?: PatientScenarioStep;
    appliedStepIds: string[];
    appliedLayerIds: string[];
  };
}
