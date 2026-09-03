import {
  EhrConfigurationChangeType,
  ehrConfigurationSchema,
  PatientProfileLayerClearPath,
  PatientProfileLayerCollectionPath,
  type PatientProfileLayer,
  PatientProfileLayerOperationType,
  PatientProfileLayerSetPath,
  type PatientProfileDocumentV1,
  patientProfileDocumentV1Schema,
  type PatientScenario,
  type ResolvedPatientScenarioStep,
  patientScenarioSchema,
  type PatientScenarioStep,
  PatientScenarioStepKind,
  type EhrConfiguration,
  type EhrSectionConfiguration,
} from '@hektor/types';

export enum PatientScenarioResolutionErrorCode {
  InvalidScenario = 'invalid_scenario',
  InvalidStepSequence = 'invalid_step_sequence',
  StepNotFound = 'step_not_found',
  CrossPatientLayer = 'cross_patient_layer',
  InvalidLayerOperation = 'invalid_layer_operation',
  InvalidResolvedPatient = 'invalid_resolved_patient',
  InvalidEhrChange = 'invalid_ehr_change',
}

export class PatientScenarioResolutionError extends Error {
  constructor(
    readonly code: PatientScenarioResolutionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'PatientScenarioResolutionError';
  }
}

export interface ResolvePatientScenarioStepInput {
  baseEhr: EhrConfiguration;
  scenario: PatientScenario;
  selectedStepId: string;
}

type CollectionItem = { id: string };

function fail(
  code: PatientScenarioResolutionErrorCode,
  message: string,
): never {
  throw new PatientScenarioResolutionError(code, message);
}

function patientCollection(
  patient: PatientProfileDocumentV1,
  path: PatientProfileLayerCollectionPath,
): CollectionItem[] {
  switch (path) {
    case PatientProfileLayerCollectionPath.Relationships:
      return patient.relationships;
    case PatientProfileLayerCollectionPath.Background:
      return patient.background;
    case PatientProfileLayerCollectionPath.Problems:
      return patient.problems;
    case PatientProfileLayerCollectionPath.Allergies:
      return patient.allergies;
    case PatientProfileLayerCollectionPath.BaselineMedications:
      return patient.baselineMedications;
    case PatientProfileLayerCollectionPath.HistoryEntries:
      return patient.history.entries;
  }
}

function applyPatientLayer(
  patient: PatientProfileDocumentV1,
  layer: PatientProfileLayer,
) {
  for (const operation of layer.operations) {
    if (
      operation.operation === PatientProfileLayerOperationType.Add ||
      operation.operation === PatientProfileLayerOperationType.Replace ||
      operation.operation === PatientProfileLayerOperationType.Remove
    ) {
      const collection = patientCollection(patient, operation.path);

      if (operation.operation === PatientProfileLayerOperationType.Add) {
        if (collection.some(({ id }) => id === operation.value.id))
          fail(
            PatientScenarioResolutionErrorCode.InvalidLayerOperation,
            `Cannot add duplicate item ${operation.value.id} to ${operation.path}`,
          );

        collection.push(structuredClone(operation.value));
        continue;
      }

      const targetIndex = collection.findIndex(
        ({ id }) => id === operation.itemId,
      );
      if (targetIndex === -1)
        fail(
          PatientScenarioResolutionErrorCode.InvalidLayerOperation,
          `Cannot ${operation.operation} missing item ${operation.itemId} in ${operation.path}`,
        );

      if (operation.operation === PatientProfileLayerOperationType.Replace) {
        if (operation.value.id !== operation.itemId)
          fail(
            PatientScenarioResolutionErrorCode.InvalidLayerOperation,
            `Replacement item ID ${operation.value.id} does not match target ${operation.itemId}`,
          );
        collection[targetIndex] = structuredClone(operation.value);
      } else collection.splice(targetIndex, 1);

      continue;
    }

    if (operation.operation === PatientProfileLayerOperationType.Set) {
      if (operation.path === PatientProfileLayerSetPath.AllergyRecordStatus)
        patient.allergyRecordStatus = operation.value;
      else patient.contact = structuredClone(operation.value);
      continue;
    }

    if (
      operation.operation === PatientProfileLayerOperationType.Clear &&
      operation.path === PatientProfileLayerClearPath.Contact
    )
      delete patient.contact;
  }
}

function requireSection(
  sections: Map<string, EhrSectionConfiguration>,
  sectionId: string,
) {
  const section = sections.get(sectionId);
  if (!section)
    fail(
      PatientScenarioResolutionErrorCode.InvalidEhrChange,
      `EHR section ${sectionId} does not exist`,
    );
  return section;
}

function applyEhrChanges(
  sections: Map<string, EhrSectionConfiguration>,
  hiddenSectionIds: Set<string>,
  step: PatientScenarioStep,
) {
  for (const change of step.ehrChanges) {
    if (change.operation === EhrConfigurationChangeType.Insert) {
      if (sections.has(change.section.id))
        fail(
          PatientScenarioResolutionErrorCode.InvalidEhrChange,
          `Cannot insert duplicate EHR section ${change.section.id}`,
        );
      sections.set(change.section.id, structuredClone(change.section));
      continue;
    }

    const section = requireSection(sections, change.sectionId);

    if (change.operation === EhrConfigurationChangeType.Configure)
      section.label = change.label;
    else if (change.operation === EhrConfigurationChangeType.Move)
      section.order = change.order;
    else if (change.operation === EhrConfigurationChangeType.Hide)
      hiddenSectionIds.add(change.sectionId);
    else hiddenSectionIds.delete(change.sectionId);
  }
}

function validateSequence(scenario: PatientScenario) {
  const orderedSteps = [...scenario.steps].sort(
    (left, right) =>
      left.position - right.position || left.id.localeCompare(right.id),
  );
  const beginningSteps = orderedSteps.filter(
    ({ kind }) => kind === PatientScenarioStepKind.Beginning,
  );

  if (
    orderedSteps.length === 0 ||
    beginningSteps.length !== 1 ||
    orderedSteps[0]?.kind !== PatientScenarioStepKind.Beginning ||
    new Set(orderedSteps.map(({ position }) => position)).size !==
      orderedSteps.length
  )
    fail(
      PatientScenarioResolutionErrorCode.InvalidStepSequence,
      'Scenario steps must have one first beginning step and unique positions',
    );

  return orderedSteps;
}

export function resolvePatientScenarioStep({
  baseEhr,
  scenario,
  selectedStepId,
}: ResolvePatientScenarioStepInput): ResolvedPatientScenarioStep {
  const parsedScenario = patientScenarioSchema.safeParse(scenario);
  const parsedPatient = patientProfileDocumentV1Schema.safeParse(
    scenario.patientProfile.document,
  );
  const parsedEhr = ehrConfigurationSchema.safeParse(baseEhr);

  if (!parsedScenario.success) {
    if (
      parsedScenario.error.issues.some(
        ({ message }) =>
          message === 'A scenario layer must belong to its patient profile',
      )
    )
      fail(
        PatientScenarioResolutionErrorCode.CrossPatientLayer,
        'A scenario layer belongs to another patient',
      );
    if (
      parsedScenario.error.issues.some(({ message }) =>
        [
          'A scenario must contain exactly one beginning step',
          'The beginning step must be first',
          'Scenario step positions must be unique',
        ].includes(message),
      )
    )
      fail(
        PatientScenarioResolutionErrorCode.InvalidStepSequence,
        'Scenario steps must have one first beginning step and unique positions',
      );
  }

  if (!parsedScenario.success || !parsedPatient.success || !parsedEhr.success)
    fail(
      PatientScenarioResolutionErrorCode.InvalidScenario,
      'Scenario input or pinned patient-profile version is invalid',
    );

  const orderedSteps = validateSequence(scenario);
  const selectedIndex = orderedSteps.findIndex(
    ({ id }) => id === selectedStepId,
  );
  if (selectedIndex === -1)
    fail(
      PatientScenarioResolutionErrorCode.StepNotFound,
      `Scenario step ${selectedStepId} does not exist`,
    );

  const appliedSteps = orderedSteps.slice(0, selectedIndex + 1);
  const patient = structuredClone(scenario.patientProfile.document);
  const sections = new Map(
    baseEhr.sections.map((section) => [section.id, structuredClone(section)]),
  );
  const hiddenSectionIds = new Set<string>();
  const appliedLayerIds: string[] = [];

  for (const step of appliedSteps) {
    const layer = step.patientProfileLayer;
    if (layer.patientProfileId !== scenario.patientProfile.patientProfileId)
      fail(
        PatientScenarioResolutionErrorCode.CrossPatientLayer,
        `Patient profile layer ${layer.id} belongs to another patient`,
      );

    applyPatientLayer(patient, layer);
    const resolvedPatient = patientProfileDocumentV1Schema.safeParse(patient);
    if (!resolvedPatient.success)
      fail(
        PatientScenarioResolutionErrorCode.InvalidResolvedPatient,
        `Patient profile layer ${layer.id} produced an invalid patient document`,
      );

    applyEhrChanges(sections, hiddenSectionIds, step);
    appliedLayerIds.push(layer.id);
  }

  const visibleSections = [...sections.values()]
    .filter(({ id }) => !hiddenSectionIds.has(id))
    .sort(
      (left, right) =>
        left.order - right.order || left.id.localeCompare(right.id),
    );
  const currentStep = orderedSteps[selectedIndex];
  if (!currentStep)
    fail(
      PatientScenarioResolutionErrorCode.StepNotFound,
      `Scenario step ${selectedStepId} does not exist`,
    );

  return {
    patient,
    ehr: { sections: visibleSections },
    context: {
      scenario: structuredClone(scenario),
      currentStep: structuredClone(currentStep),
      ...(orderedSteps[selectedIndex - 1]
        ? { previousStep: structuredClone(orderedSteps[selectedIndex - 1]) }
        : {}),
      ...(orderedSteps[selectedIndex + 1]
        ? { nextStep: structuredClone(orderedSteps[selectedIndex + 1]) }
        : {}),
      appliedStepIds: appliedSteps.map(({ id }) => id),
      appliedLayerIds,
    },
  };
}
