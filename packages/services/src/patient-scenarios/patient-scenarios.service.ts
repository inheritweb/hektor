import {
  defaultPatientProfileEhrConfiguration,
  PatientProfileScope,
  PatientScenarioStatus,
  PatientScenarioStepKind,
  type CreatePatientScenarioDraftInput,
  type PatientScenario,
  type PatientScenarioSummary,
  type ResolvedPatientScenarioStep,
  type UpdatePatientScenarioDraftInput,
} from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';
import { patientScenarioSummarySchema } from '@hektor/types/contracts/patient-scenarios';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';
import { mapPatientScenarioAggregate } from './patient-scenario.mapper';
import { resolvePatientScenarioStep } from './patient-scenario-resolver';

function databaseFailure(message: string, error: { message: string }): never {
  throw createServiceError(HektorErrorCode.InternalServerError, {
    message,
    internalMessage: error.message,
    cause: error,
  });
}

export function createPatientScenariosService(client: DatabaseClient) {
  async function listAdminPatientScenarioCatalogue(): Promise<
    PatientScenario[]
  > {
    const scenarios = await client
      .from('patient_scenarios')
      .select('id')
      .eq('scope', PatientProfileScope.System)
      .in('status', [
        PatientScenarioStatus.Draft,
        PatientScenarioStatus.Published,
      ])
      .order('title');
    if (scenarios.error)
      databaseFailure('Unable to load patient scenarios', scenarios.error);

    return Promise.all(
      scenarios.data.map(({ id }) => getAdminPatientScenarioBy('id', id)),
    );
  }

  async function createAdminPatientScenarioDraft(
    patientProfileId: string,
    patientProfileVersionId: string,
    input: CreatePatientScenarioDraftInput,
  ): Promise<PatientScenario> {
    const creation = await client.rpc('create_system_patient_scenario_draft', {
      p_patient_profile_id: patientProfileId,
      p_patient_profile_version_id: patientProfileVersionId,
      p_slug: input.slug,
      p_title: input.title,
      p_description: input.description,
      p_care_setting: input.careSetting,
      p_intended_clinical_audiences: input.intendedClinicalAudiences,
      p_beginning_step_title: input.beginningStep.title,
      ...(input.beginningStep.description
        ? { p_beginning_step_description: input.beginningStep.description }
        : {}),
    });
    if (creation.error) {
      if (creation.error.code === '23505')
        throw createServiceError(HektorErrorCode.Conflict, {
          message: 'A system scenario already uses this slug',
          data: { slug: 'Choose a different slug' },
          internalMessage: creation.error.message,
          cause: creation.error,
        });
      if (creation.error.code === 'P0002')
        throw createServiceError(HektorErrorCode.NotFound, {
          message: 'Patient profile version not found',
          cause: creation.error,
        });
      databaseFailure('Unable to create patient scenario', creation.error);
    }

    return getAdminPatientScenarioBy('id', creation.data);
  }

  async function listAdminPatientScenarios(
    patientProfileId: string,
    patientProfileVersionId: string,
  ): Promise<PatientScenarioSummary[]> {
    const scenarios = await client
      .from('patient_scenarios')
      .select('*')
      .eq('scope', PatientProfileScope.System)
      .eq('patient_profile_id', patientProfileId)
      .eq('patient_profile_version_id', patientProfileVersionId)
      .in('status', [
        PatientScenarioStatus.Draft,
        PatientScenarioStatus.Published,
      ])
      .order('title');
    if (scenarios.error)
      databaseFailure('Unable to load patient scenarios', scenarios.error);
    if (!scenarios.data.length) return [];

    const scenarioIds = scenarios.data.map(({ id }) => id);
    const [versions, beginningSteps] = await Promise.all([
      client
        .from('patient_profile_versions')
        .select('id, version_number')
        .in(
          'id',
          scenarios.data.map(({ patient_profile_version_id: id }) => id),
        ),
      client
        .from('patient_scenario_steps')
        .select('id, scenario_id, title')
        .in('scenario_id', scenarioIds)
        .eq('kind', PatientScenarioStepKind.Beginning),
    ]);
    if (versions.error)
      databaseFailure('Unable to load patient scenarios', versions.error);
    if (beginningSteps.error)
      databaseFailure('Unable to load patient scenarios', beginningSteps.error);

    return scenarios.data.flatMap((scenario) => {
      const version = versions.data.find(
        ({ id }) => id === scenario.patient_profile_version_id,
      );
      const beginningStep = beginningSteps.data.find(
        ({ scenario_id: id }) => id === scenario.id,
      );
      if (!version || !beginningStep)
        throw createServiceError(HektorErrorCode.InternalServerError, {
          message: 'Unable to load patient scenario',
          internalMessage: `Scenario ${scenario.id} is incomplete`,
        });

      return [
        patientScenarioSummarySchema.parse({
          id: scenario.id,
          slug: scenario.slug,
          title: scenario.title,
          description: scenario.description,
          careSetting: scenario.care_setting,
          intendedClinicalAudiences: scenario.intended_clinical_audiences,
          status: scenario.status,
          patientProfileVersion: {
            id: version.id,
            versionNumber: version.version_number,
          },
          beginningStep: {
            id: beginningStep.id,
            title: beginningStep.title,
          },
        }),
      ];
    });
  }

  async function getAdminPatientScenarioBy(
    column: 'id' | 'slug',
    value: string,
  ): Promise<PatientScenario> {
    const scenario = await client
      .from('patient_scenarios')
      .select('*')
      .eq(column, value)
      .eq('scope', PatientProfileScope.System)
      .maybeSingle();
    if (scenario.error)
      databaseFailure('Unable to load patient scenario', scenario.error);
    if (!scenario.data)
      throw createServiceError(HektorErrorCode.NotFound, {
        message: 'Patient scenario not found',
      });

    const [version, steps] = await Promise.all([
      client
        .from('patient_profile_versions')
        .select('*')
        .eq('id', scenario.data.patient_profile_version_id)
        .single(),
      client
        .from('patient_scenario_steps')
        .select('*')
        .eq('scenario_id', scenario.data.id)
        .order('position'),
    ]);
    if (version.error)
      databaseFailure('Unable to load patient scenario', version.error);
    if (steps.error)
      databaseFailure('Unable to load patient scenario', steps.error);

    const layers = await client
      .from('patient_profile_layers')
      .select('*')
      .in(
        'id',
        steps.data.map(({ patient_profile_layer_id: id }) => id),
      );
    if (layers.error)
      databaseFailure('Unable to load patient scenario', layers.error);

    return mapPatientScenarioAggregate({
      scenario: scenario.data,
      patientProfileVersion: version.data,
      steps: steps.data.map((step) => {
        const patientProfileLayer = layers.data.find(
          ({ id }) => id === step.patient_profile_layer_id,
        );
        if (!patientProfileLayer)
          throw createServiceError(HektorErrorCode.InternalServerError, {
            message: 'Unable to load patient scenario',
            internalMessage: `Layer ${step.patient_profile_layer_id} is missing`,
          });
        return { step, patientProfileLayer };
      }),
    });
  }

  async function getAdminPatientScenario(
    scenarioId: string,
  ): Promise<PatientScenario> {
    return getAdminPatientScenarioBy('id', scenarioId);
  }

  async function updateAdminPatientScenarioDraft(
    scenarioId: string,
    input: UpdatePatientScenarioDraftInput,
  ): Promise<PatientScenario> {
    const update = await client.rpc('update_system_patient_scenario_draft', {
      p_scenario_id: scenarioId,
      p_expected_updated_at: input.expectedUpdatedAt,
      p_slug: input.slug,
      p_title: input.title,
      p_description: input.description,
      p_care_setting: input.careSetting,
      p_intended_clinical_audiences: input.intendedClinicalAudiences,
      p_beginning_step_title: input.beginningStep.title,
      ...(input.beginningStep.description
        ? { p_beginning_step_description: input.beginningStep.description }
        : {}),
    });
    if (update.error) {
      if (update.error.code === '23505')
        throw createServiceError(HektorErrorCode.Conflict, {
          message: 'A system scenario already uses this slug',
          data: { slug: 'Choose a different slug' },
          internalMessage: update.error.message,
          cause: update.error,
        });
      if (update.error.code === 'P0002')
        throw createServiceError(HektorErrorCode.NotFound, {
          message: 'Patient scenario not found',
          cause: update.error,
        });
      if (update.error.code === 'P0001')
        throw createServiceError(HektorErrorCode.Conflict, {
          message:
            update.error.message ===
            'Patient scenario has changed since it was loaded'
              ? 'This scenario changed after you opened it. Refresh and try again.'
              : update.error.message,
          cause: update.error,
        });
      databaseFailure('Unable to update patient scenario', update.error);
    }

    return getAdminPatientScenarioBy('id', update.data);
  }

  async function getAdminPatientScenarioResolvedRecord(
    scenarioSlug: string,
    selectedStepId?: string,
  ): Promise<ResolvedPatientScenarioStep> {
    const scenario = await getAdminPatientScenarioBy('slug', scenarioSlug);
    const beginningStep = scenario.steps.find(
      ({ kind }) => kind === PatientScenarioStepKind.Beginning,
    );
    if (!beginningStep)
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to load patient scenario',
        internalMessage: `Scenario ${scenario.id} has no beginning step`,
      });

    return resolvePatientScenarioStep({
      baseEhr: defaultPatientProfileEhrConfiguration,
      scenario,
      selectedStepId: selectedStepId ?? beginningStep.id,
    });
  }

  return {
    listAdminPatientScenarioCatalogue,
    createAdminPatientScenarioDraft,
    getAdminPatientScenario,
    listAdminPatientScenarios,
    getAdminPatientScenarioResolvedRecord,
    updateAdminPatientScenarioDraft,
  };
}
