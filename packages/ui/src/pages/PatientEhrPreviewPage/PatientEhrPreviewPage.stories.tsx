import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  EhrSectionType,
  PatientAllergyRecordStatus,
  PatientCareSetting,
  PatientDataSensitivity,
  PatientHistoryDatePrecision,
  PatientHistoryEntryType,
  PatientHistoricalCarePlanStatus,
  PatientHistoricalEncounterType,
  PatientInvestigationKind,
  PatientInvestigationStatus,
  PatientObservationInterpretation,
  PatientObservationValueType,
  PatientReferralStatus,
} from '@hektor/types';

import { PatientEhrPreviewPage } from './PatientEhrPreviewPage.component';

const meta = {
  title: 'Pages/PatientEhrPreviewPage',
  component: PatientEhrPreviewPage,
  parameters: { layout: 'fullscreen' },
  args: {
    exitHref: '#patient-profile',
    patient: {
      allergyRecordStatus: PatientAllergyRecordStatus.KnownAllergies,
      allergies: [
        {
          clinicalStatus: 'active',
          details: 'Reaction documented following previous treatment.',
          id: 'erythromycin',
          reactions: ['Diarrhoea', 'Abdominal pain'],
          severity: 'moderate',
          substance: 'Erythromycin',
          verificationStatus: 'unconfirmed',
        },
      ],
      communication: {
        accessibilityNeeds: [
          {
            id: 'post-stroke-processing',
            summary: 'Allow additional time to process information.',
            details:
              'Use short sentences, reduce distractions and confirm understanding.',
          },
        ],
        languages: [
          {
            id: 'english',
            interpreterRequirement: {
              status: 'known',
              value: 'Not required',
            },
            language: 'English',
            preferred: true,
            proficiency: 'native',
          },
        ],
        preferences: [
          {
            id: 'clear-verbal-information',
            summary: 'Prefers clear verbal explanations.',
            details:
              'Pause between topics and provide written information to reinforce key points.',
          },
        ],
      },
      dateOfBirth: '1951-09-19',
      details: {
        address: [
          '41 Meadow View',
          'Salford',
          'Greater Manchester',
          'M6 8QR',
          'United Kingdom',
        ],
        ethnicity: { status: 'known', value: 'White British' },
        faithOrBelief: { status: 'unknown' },
        gpPractice: 'Openshaw Health Centre',
        handedness: 'Right-handed',
        nationality: { status: 'not_recorded' },
        nextOfKin: [
          'Tasha Jenkins (Daughter) — 07SIM000205 — lives with patient',
        ],
        occupationAndSocial:
          'Retired cleaner. Lives with her daughter in a terraced house. Widowed.',
        phone: '0161 496 0183',
        pronouns: { status: 'known', value: 'she/her' },
        sexAtBirth: { status: 'known', value: 'female' },
      },
      displayName: 'Esther Jenkins',
      recordName: 'Jenkins, Esther',
      identifiers: [
        {
          display: 'Hektor patient number',
          value: 'SIM-HKT-37194',
        },
      ],
      organisationName: 'Jean McFarlane Trust',
      personalContext: [
        {
          category: 'occupation',
          id: 'retired-cleaner',
          summary: 'Retired cleaner.',
        },
        {
          category: 'living_arrangements',
          details: 'The property has stairs and no downstairs bathroom.',
          id: 'living-with-daughter',
          summary: 'Lives with her daughter Tasha in a terraced house.',
        },
      ],
      baselineMedications: [
        {
          dose: '5 mg',
          frequency: 'Once daily',
          id: 'amlodipine',
          indication: 'Hypertension',
          medication: 'Amlodipine',
          route: 'Oral',
          status: 'active',
        },
      ],
      clinicalHistory: {
        familyHistory: ['Mother had a stroke in her seventies.'],
        lifestyleAndSocialHistory: [
          'Never smoked. Drinks alcohol occasionally.',
        ],
        pastMedicalHistory: ['Hypertension — Diagnosed in 2012.'],
      },
      historyEntries: [
        {
          assessment: { display: 'Hypertension assessment' },
          id: 'hypertension-diagnosis',
          occurred: {
            start: {
              approximate: true,
              precision: PatientHistoryDatePrecision.Year,
              value: '2016',
            },
          },
          outcome: 'Hypertension diagnosed; monitoring commenced.',
          sensitivity: PatientDataSensitivity.Standard,
          summary: 'Hypertension diagnosed approximately ten years ago.',
          type: PatientHistoryEntryType.Assessment,
        },
        {
          id: 'home-blood-pressure',
          interpretation: PatientObservationInterpretation.High,
          observation: { display: 'Home blood pressure' },
          sensitivity: PatientDataSensitivity.Standard,
          summary: 'Recent home blood pressure measurement.',
          type: PatientHistoryEntryType.Observation,
          value: {
            type: PatientObservationValueType.Text,
            value: 'Approximately 160/90 mmHg',
          },
        },
      ],
      problems: [
        {
          clinicalStatus: 'active',
          details: 'Requires ongoing primary-care monitoring.',
          id: 'hypertension',
          onsetDate: '2012-03-14',
          problem: 'Hypertension',
        },
        {
          clinicalStatus: 'resolved',
          id: 'depression',
          onsetDate: '2008-06-01',
          problem: 'Depressive episode',
          resolvedDate: '2009-02-01',
        },
      ],
      recordContext: 'Stroke Unit — Simulated Practice Placement',
      relationships: [
        {
          id: 'tasha-jenkins',
          name: 'Tasha Jenkins',
          notes: 'Lives with Esther and visits daily.',
          phone: '07SIM000205',
          relationship: 'Daughter',
          roles: ['next_of_kin', 'carer'],
        },
      ],
      versionNumber: 1,
      versionState: 'draft',
    },
  },
} satisfies Meta<typeof PatientEhrPreviewPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BaseProfilePreview: Story = {};

export const NarrowPatientDetails: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const AboutMe: Story = {
  args: { initialSection: EhrSectionType.AboutMe },
};

export const NarrowAboutMe: Story = {
  args: { initialSection: EhrSectionType.AboutMe },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const AllergiesAdverseReactionsAndAlerts: Story = {
  args: {
    initialSection: EhrSectionType.AllergiesAdverseReactionsAndAlerts,
  },
};

export const AllergyStatusNotRecorded: Story = {
  args: {
    initialSection: EhrSectionType.AllergiesAdverseReactionsAndAlerts,
    patient: {
      ...meta.args.patient,
      allergies: [],
      allergyRecordStatus: PatientAllergyRecordStatus.NotRecorded,
    },
  },
};

export const MedicationsAndMedicinesOptimisation: Story = {
  args: {
    initialSection: EhrSectionType.MedicationsAndMedicinesOptimisation,
    patient: {
      ...meta.args.patient,
      baselineMedications: [
        ...meta.args.patient.baselineMedications,
        {
          details: 'Evening doses are often forgotten.',
          dose: '5 mg',
          frequency: 'Twice daily',
          id: 'apixaban',
          indication: 'Atrial fibrillation',
          medication: 'Apixaban',
          route: 'Oral',
          status: 'active',
        },
        {
          frequency: 'As required',
          id: 'naproxen',
          indication: 'Knee osteoarthritis',
          medication: 'Naproxen',
          route: 'Oral',
          status: 'inactive',
        },
      ],
    },
  },
};

export const NarrowMedications: Story = {
  ...MedicationsAndMedicinesOptimisation,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const NoBaselineMedicationsRecorded: Story = {
  args: {
    initialSection: EhrSectionType.MedicationsAndMedicinesOptimisation,
    patient: { ...meta.args.patient, baselineMedications: [] },
  },
};

export const ProblemListAndClinicalHistory: Story = {
  args: { initialSection: EhrSectionType.ProblemListAndClinicalHistory },
};

export const EmptyProblemListAndClinicalHistory: Story = {
  args: {
    initialSection: EhrSectionType.ProblemListAndClinicalHistory,
    patient: { ...meta.args.patient, historyEntries: [], problems: [] },
  },
};

export const StandardisedAssessmentsAndRiskScreening: Story = {
  args: {
    initialSection: EhrSectionType.StandardisedAssessmentsAndRiskScreening,
    patient: {
      ...meta.args.patient,
      historyEntries: [
        ...meta.args.patient.historyEntries,
        {
          assessment: { display: 'Baseline activities assessment' },
          components: [
            'Independent mobility',
            'Independent personal care',
            'Independent dressing',
          ],
          id: 'baseline-activities',
          outcome: 'Independent before the scenario boundary.',
          sensitivity: PatientDataSensitivity.Standard,
          summary: 'Baseline activities and support needs were assessed.',
          type: PatientHistoryEntryType.Assessment,
        },
      ],
    },
  },
};

export const NoBaseAssessmentsRecorded: Story = {
  args: {
    initialSection: EhrSectionType.StandardisedAssessmentsAndRiskScreening,
    patient: { ...meta.args.patient, historyEntries: [] },
  },
};

export const CareAndSupportPlanning: Story = {
  args: {
    initialSection: EhrSectionType.CareAndSupportPlanning,
    patient: {
      ...meta.args.patient,
      historyEntries: [
        ...meta.args.patient.historyEntries,
        {
          evaluation: 'The plan remains active and under review.',
          goals: ['Maintain independence', 'Reduce avoidable deterioration'],
          id: 'community-support-plan',
          interventions: [
            'Regular community nursing review',
            'Coordinate support with the named carer',
          ],
          need: 'Coordinated recovery and community support.',
          sensitivity: PatientDataSensitivity.Standard,
          status: PatientHistoricalCarePlanStatus.ActiveAtBoundary,
          summary: 'Community recovery and support plan.',
          type: PatientHistoryEntryType.CarePlan,
        },
      ],
    },
  },
};

export const NoDurableCarePlanRecorded: Story = {
  args: {
    initialSection: EhrSectionType.CareAndSupportPlanning,
    patient: { ...meta.args.patient, historyEntries: [] },
  },
};

export const ObservationsInvestigationsAndProcedures: Story = {
  args: {
    initialSection: EhrSectionType.ObservationsInvestigationsAndProcedures,
    patient: {
      ...meta.args.patient,
      historyEntries: [
        ...meta.args.patient.historyEntries,
        {
          conclusion: 'Gestational diabetes confirmed and managed with diet.',
          id: 'oral-glucose-tolerance-test',
          investigation: { display: 'Oral glucose tolerance test' },
          kind: PatientInvestigationKind.Laboratory,
          results: [
            {
              id: 'fasting-glucose',
              interpretation: PatientObservationInterpretation.High,
              observation: { display: 'Fasting plasma glucose' },
              value: {
                type: PatientObservationValueType.Quantity,
                unit: 'mmol/L',
                value: 5.9,
              },
            },
          ],
          sensitivity: PatientDataSensitivity.Restricted,
          status: PatientInvestigationStatus.Final,
          summary: 'Oral glucose tolerance test completed.',
          type: PatientHistoryEntryType.Investigation,
        },
        {
          id: 'cardiac-repair',
          outcome: 'Good initial recovery.',
          procedure: { display: 'Surgical cardiac repair' },
          sensitivity: PatientDataSensitivity.Restricted,
          summary: 'Cardiac defect surgically repaired.',
          type: PatientHistoryEntryType.Procedure,
        },
      ],
    },
  },
};

export const NoDurableObservationsInvestigationsOrProcedures: Story = {
  args: {
    initialSection: EhrSectionType.ObservationsInvestigationsAndProcedures,
    patient: { ...meta.args.patient, historyEntries: [] },
  },
};

export const CareEncountersAndTransitions: Story = {
  args: {
    initialSection: EhrSectionType.CareEncountersAndTransitions,
    patient: {
      ...meta.args.patient,
      historyEntries: [
        ...meta.args.patient.historyEntries,
        {
          careSetting: PatientCareSetting.CommunityMentalHealth,
          encounterType: PatientHistoricalEncounterType.CommunityContact,
          id: 'community-care-pathway',
          outcome: 'Transferred from acute assessment to community care.',
          reason: 'Ongoing treatment and support.',
          sensitivity: PatientDataSensitivity.Restricted,
          service: 'Community Mental Health Team',
          summary: 'Progressed to community mental health care.',
          type: PatientHistoryEntryType.Encounter,
        },
        {
          id: 'specialist-referral',
          outcome: 'Specialist care established.',
          reason: 'Ongoing specialist treatment required.',
          referredFrom: 'Primary care',
          referredTo: 'Specialist service',
          sensitivity: PatientDataSensitivity.Standard,
          status: PatientReferralStatus.Accepted,
          summary: 'Referred for specialist care.',
          type: PatientHistoryEntryType.Referral,
        },
      ],
    },
  },
};

export const NoDurableEncountersOrTransitions: Story = {
  args: {
    initialSection: EhrSectionType.CareEncountersAndTransitions,
    patient: { ...meta.args.patient, historyEntries: [] },
  },
};

export const DocumentsModulePending: Story = {
  args: { initialSection: EhrSectionType.DocumentsAndCorrespondence },
};

export const NarrowDocumentsModulePending: Story = {
  args: { initialSection: EhrSectionType.DocumentsAndCorrespondence },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
