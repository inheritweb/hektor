export enum EhrSectionType {
  DemographicAndAdministrative = 'demographic_and_administrative',
  AboutMe = 'about_me',
  AllergiesAdverseReactionsAndAlerts = 'allergies_adverse_reactions_and_alerts',
  MedicationsAndMedicinesOptimisation = 'medications_and_medicines_optimisation',
  ProblemListAndClinicalHistory = 'problem_list_and_clinical_history',
  StandardisedAssessmentsAndRiskScreening = 'standardised_assessments_and_risk_screening',
  CareAndSupportPlanning = 'care_and_support_planning',
  ObservationsInvestigationsAndProcedures = 'observations_investigations_and_procedures',
  CareEncountersAndTransitions = 'care_encounters_and_transitions',
  EndOfLifeAndEmergencyCarePlanning = 'end_of_life_and_emergency_care_planning',
  Safeguarding = 'safeguarding',
  MultiProfessionalCommunication = 'multi_professional_communication',
  DocumentsAndCorrespondence = 'documents_and_correspondence',
}

export interface EhrSectionConfiguration {
  id: string;
  type: EhrSectionType;
  order: number;
  label?: string;
}

export interface EhrConfiguration {
  sections: EhrSectionConfiguration[];
}
