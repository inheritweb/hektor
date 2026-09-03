import {
  defaultPatientProfileEhrConfiguration,
  EhrSectionType,
  type EhrConfiguration,
  type EhrSectionConfiguration,
} from '@hektor/types';

export interface EhrSectionDefinition {
  label: string;
  type: EhrSectionType;
}

export const ehrSectionRegistry = {
  [EhrSectionType.DemographicAndAdministrative]: {
    label: 'Demographic and administrative',
    type: EhrSectionType.DemographicAndAdministrative,
  },
  [EhrSectionType.AboutMe]: {
    label: 'About me',
    type: EhrSectionType.AboutMe,
  },
  [EhrSectionType.AllergiesAdverseReactionsAndAlerts]: {
    label: 'Allergies, adverse reactions & alerts',
    type: EhrSectionType.AllergiesAdverseReactionsAndAlerts,
  },
  [EhrSectionType.MedicationsAndMedicinesOptimisation]: {
    label: 'Medications / medicines optimisation',
    type: EhrSectionType.MedicationsAndMedicinesOptimisation,
  },
  [EhrSectionType.ProblemListAndClinicalHistory]: {
    label: 'Problem list / clinical history',
    type: EhrSectionType.ProblemListAndClinicalHistory,
  },
  [EhrSectionType.StandardisedAssessmentsAndRiskScreening]: {
    label: 'Standardised assessments and risk screening',
    type: EhrSectionType.StandardisedAssessmentsAndRiskScreening,
  },
  [EhrSectionType.CareAndSupportPlanning]: {
    label: 'Care and support planning',
    type: EhrSectionType.CareAndSupportPlanning,
  },
  [EhrSectionType.ObservationsInvestigationsAndProcedures]: {
    label: 'Observations, investigations and procedures',
    type: EhrSectionType.ObservationsInvestigationsAndProcedures,
  },
  [EhrSectionType.CareEncountersAndTransitions]: {
    label: 'Care encounters and transitions',
    type: EhrSectionType.CareEncountersAndTransitions,
  },
  [EhrSectionType.EndOfLifeAndEmergencyCarePlanning]: {
    label: 'End-of-life and emergency care planning',
    type: EhrSectionType.EndOfLifeAndEmergencyCarePlanning,
  },
  [EhrSectionType.Safeguarding]: {
    label: 'Safeguarding',
    type: EhrSectionType.Safeguarding,
  },
  [EhrSectionType.MultiProfessionalCommunication]: {
    label: 'Multi-professional communication',
    type: EhrSectionType.MultiProfessionalCommunication,
  },
  [EhrSectionType.DocumentsAndCorrespondence]: {
    label: 'Documents / correspondence',
    type: EhrSectionType.DocumentsAndCorrespondence,
  },
} satisfies Record<EhrSectionType, EhrSectionDefinition>;

export { defaultPatientProfileEhrConfiguration };

export function resolveEhrSections(
  configuration: EhrConfiguration,
): EhrSectionConfiguration[] {
  return configuration.sections
    .map((section) => ({ ...section }))
    .sort(
      (left, right) =>
        left.order - right.order || left.id.localeCompare(right.id),
    );
}

export function ehrSectionLabel(section: EhrSectionConfiguration) {
  return section.label ?? ehrSectionRegistry[section.type].label;
}
