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
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import {
  PatientEhrPreviewPage,
  type PatientEhrPreviewViewModel,
} from './PatientEhrPreviewPage.component';

const patient = {
  allergyRecordStatus: PatientAllergyRecordStatus.KnownAllergies,
  allergies: [
    {
      clinicalStatus: 'active',
      id: 'penicillin',
      reactions: ['Generalised urticaria'],
      severity: 'moderate',
      substance: 'Penicillin',
      verificationStatus: 'confirmed',
    },
  ],
  communication: {
    accessibilityNeeds: [
      {
        id: 'processing-time',
        summary: 'Allow additional processing time.',
      },
    ],
    languages: [
      {
        id: 'french',
        interpreterRequirement: { status: 'known', value: 'Required' },
        language: 'French',
        preferred: true,
        proficiency: 'fluent',
      },
    ],
    preferences: [
      {
        id: 'plain-language',
        summary: 'Use clear, plain language.',
      },
    ],
  },
  dateOfBirth: '1951-09-19',
  details: {
    ethnicity: { status: 'known', value: 'White British' },
    faithOrBelief: { status: 'unknown' },
    nationality: { status: 'not_recorded' },
    nextOfKin: ['Tasha Jenkins (Daughter)'],
    pronouns: { status: 'known', value: 'she/her' },
    sexAtBirth: { status: 'known', value: 'female' },
  },
  displayName: 'Esther Jenkins',
  recordName: 'Jenkins, Esther',
  identifiers: [{ display: 'Hektor patient number', value: 'SIM-HKT-37194' }],
  organisationName: 'Jean McFarlane Trust',
  personalContext: [
    {
      category: 'occupation',
      id: 'retired-cleaner',
      summary: 'Retired cleaner.',
    },
    {
      category: 'living_arrangements',
      id: 'living-with-daughter',
      summary: 'Lives with her daughter Tasha.',
    },
  ],
  baselineMedications: [
    {
      dose: '5 mg',
      frequency: 'Once daily',
      id: 'amlodipine',
      medication: 'Amlodipine',
      route: 'Oral',
      status: 'active',
    },
  ],
  clinicalHistory: {
    familyHistory: ['Mother had a stroke in her seventies.'],
    lifestyleAndSocialHistory: ['Never smoked.'],
    pastMedicalHistory: ['Hypertension'],
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
      outcome: 'Hypertension diagnosed.',
      sensitivity: PatientDataSensitivity.Standard,
      summary: 'Hypertension diagnosed approximately ten years ago.',
      type: PatientHistoryEntryType.Assessment,
    },
  ],
  problems: [
    {
      clinicalStatus: 'active',
      id: 'shoulder-instability',
      onsetDate: '1973-01-01',
      problem: 'Recurrent right shoulder instability',
    },
  ],
  recordContext: 'Base profile preview',
  relationships: [
    {
      id: 'tasha-jenkins',
      name: 'Tasha Jenkins',
      relationship: 'Daughter',
      roles: ['next_of_kin'],
    },
  ],
  versionNumber: 1,
  versionState: 'draft',
} satisfies PatientEhrPreviewViewModel;

afterEach(cleanup);

describe('PatientEhrPreviewPage', () => {
  it('renders the demographic and administrative module from the patient profile', () => {
    render(<PatientEhrPreviewPage exitHref="#exit" patient={patient} />);

    expect(
      screen.getByRole('heading', {
        name: 'Demographic and administrative',
      }),
    ).toBeTruthy();
    expect(screen.getAllByText('Jenkins, Esther').length).toBeGreaterThan(0);
    expect(screen.getByText('Tasha Jenkins (Daughter)')).toBeTruthy();
    expect(
      within(
        screen.getByRole('navigation', { name: 'Patient record sections' }),
      ).getAllByRole('button'),
    ).toHaveLength(13);
  });

  it('switches accessibly to the profile-driven About me module', async () => {
    const user = userEvent.setup();
    render(<PatientEhrPreviewPage exitHref="#exit" patient={patient} />);

    const aboutMeNavigation = screen.getByRole('button', {
      name: /About me/,
    });
    await user.click(aboutMeNavigation);

    const heading = screen.getByRole('heading', {
      name: 'About me',
    });
    expect(document.activeElement).toBe(heading);
    expect(aboutMeNavigation.getAttribute('aria-current')).toBe('page');
    expect(screen.getByText('Retired cleaner.')).toBeTruthy();
    expect(screen.getByText('Lives with her daughter Tasha.')).toBeTruthy();
    expect(screen.getByText(/Use clear, plain language/)).toBeTruthy();
  });

  it('does not describe an unimplemented module as an empty clinical record', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.DocumentsAndCorrespondence}
        patient={patient}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Documents / correspondence' }),
    ).toBeTruthy();
    expect(screen.queryByText(/no information|none recorded/i)).toBeNull();
  });

  it('renders recorded reactions and preserves verification status', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.AllergiesAdverseReactionsAndAlerts}
        patient={patient}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Penicillin' })).toBeTruthy();
    expect(screen.getByText('Generalised urticaria')).toBeTruthy();
    expect(screen.getByText(/active · confirmed/i)).toBeTruthy();
  });

  it('distinguishes NKDA from an unrecorded allergy status', () => {
    const { rerender } = render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.AllergiesAdverseReactionsAndAlerts}
        patient={{
          ...patient,
          allergies: [],
          allergyRecordStatus: PatientAllergyRecordStatus.NoKnownDrugAllergies,
        }}
      />,
    );

    expect(screen.getByText(/No known drug allergies \(NKDA\)/)).toBeTruthy();

    rerender(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.AllergiesAdverseReactionsAndAlerts}
        patient={{
          ...patient,
          allergies: [],
          allergyRecordStatus: PatientAllergyRecordStatus.NotRecorded,
        }}
      />,
    );

    expect(screen.getByText(/This does not mean/)).toBeTruthy();
    expect(screen.queryByText(/No known drug allergies \(NKDA\)/)).toBeNull();
  });

  it('renders every baseline medication field in the medicines module', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.MedicationsAndMedicinesOptimisation}
        patient={{
          ...patient,
          baselineMedications: [
            {
              details: 'Evening doses are sometimes missed.',
              dose: '5 mg',
              frequency: 'Twice daily',
              id: 'apixaban',
              indication: 'Atrial fibrillation',
              medication: 'Apixaban',
              route: 'Oral',
              status: 'active',
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: /Medications \/ medicines optimisation/,
      }),
    ).toBeTruthy();
    expect(screen.getAllByText('Apixaban')).toHaveLength(2);
    expect(screen.getAllByText('5 mg')).toHaveLength(2);
    expect(screen.getAllByText('Twice daily')).toHaveLength(2);
    expect(screen.getAllByText('Atrial fibrillation')).toHaveLength(2);
    expect(
      screen.getAllByText('Evening doses are sometimes missed.'),
    ).toHaveLength(2);
    expect(screen.getByText(/Active allergy alert/)).toBeTruthy();
  });

  it('does not infer that an empty baseline list means no medicines', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.MedicationsAndMedicinesOptimisation}
        patient={{ ...patient, baselineMedications: [] }}
      />,
    );

    expect(screen.getByText('No baseline medications recorded')).toBeTruthy();
    expect(screen.queryByText(/^No medications$/)).toBeNull();
  });

  it('provides adjacent patient EHR navigation in the preview tools', async () => {
    const user = userEvent.setup();
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        nextPatient={{ href: '/ehr/patients/next', label: 'Next Patient' }}
        patient={patient}
        previousPatient={{
          href: '/ehr/patients/previous',
          label: 'Previous Patient',
        }}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Open simulation tools' }),
    );

    expect(
      screen
        .getByRole('link', { name: 'Previous EHR: Previous Patient' })
        .getAttribute('href'),
    ).toBe('/ehr/patients/previous');
    expect(
      screen
        .getByRole('link', { name: 'Next EHR: Next Patient' })
        .getAttribute('href'),
    ).toBe('/ehr/patients/next');
  });

  it('renders durable problems and structured clinical history', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.ProblemListAndClinicalHistory}
        patient={patient}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Problem list / clinical history' }),
    ).toBeTruthy();
    expect(
      screen.getByText('Recurrent right shoulder instability'),
    ).toBeTruthy();
    expect(
      screen.getByText('Hypertension diagnosed approximately ten years ago.'),
    ).toBeTruthy();
    expect(screen.getByText('Hypertension assessment')).toBeTruthy();
    expect(screen.getByText('Hypertension diagnosed.')).toBeTruthy();
    expect(screen.getByText('About 2016')).toBeTruthy();
  });

  it('renders only structured historical assessments in the assessments module', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.StandardisedAssessmentsAndRiskScreening}
        patient={{
          ...patient,
          historyEntries: [
            ...patient.historyEntries,
            {
              assessment: { display: 'Baseline activities assessment' },
              components: ['Independent mobility', 'Independent dressing'],
              id: 'baseline-activities',
              outcome: 'Independent before the scenario boundary.',
              sensitivity: PatientDataSensitivity.Standard,
              summary: 'Baseline activities were assessed.',
              type: PatientHistoryEntryType.Assessment,
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Standardised assessments and risk screening',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Baseline activities assessment')).toBeTruthy();
    expect(screen.getByText('Independent mobility')).toBeTruthy();
    expect(screen.queryByText('Hypertension assessment')).toBeNull();
  });

  it('does not imply that an empty base assessment record means no risk', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.StandardisedAssessmentsAndRiskScreening}
        patient={patient}
      />,
    );

    expect(screen.getByText(/This does not mean/)).toBeTruthy();
    expect(screen.getByText(/Scenario-specific assessments/)).toBeTruthy();
  });

  it('renders an authored historical care and support plan', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.CareAndSupportPlanning}
        patient={{
          ...patient,
          historyEntries: [
            ...patient.historyEntries,
            {
              evaluation: 'The plan remains in progress.',
              goals: ['Remain safely at home'],
              id: 'community-support-plan',
              interventions: ['Weekly community nursing contact'],
              need: 'Coordinated recovery support.',
              sensitivity: PatientDataSensitivity.Standard,
              status: PatientHistoricalCarePlanStatus.ActiveAtBoundary,
              summary: 'Community recovery and support plan.',
              type: PatientHistoryEntryType.CarePlan,
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Care and support planning' }),
    ).toBeTruthy();
    expect(
      screen.getByText('Community recovery and support plan.'),
    ).toBeTruthy();
    expect(screen.getByText('Coordinated recovery support.')).toBeTruthy();
    expect(screen.getByText('Remain safely at home')).toBeTruthy();
    expect(screen.getByText('Weekly community nursing contact')).toBeTruthy();
    expect(screen.getByText('The plan remains in progress.')).toBeTruthy();
  });

  it('does not infer a care plan from other profile facts', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.CareAndSupportPlanning}
        patient={patient}
      />,
    );

    expect(screen.getByText(/No durable care or support plan/)).toBeTruthy();
    expect(screen.getByText(/does not mean/)).toBeTruthy();
  });

  it('renders durable observations, investigation results and procedures', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.ObservationsInvestigationsAndProcedures}
        patient={{
          ...patient,
          historyEntries: [
            {
              id: 'home-blood-pressure',
              interpretation: PatientObservationInterpretation.High,
              observation: { display: 'Home blood pressure' },
              sensitivity: PatientDataSensitivity.Standard,
              summary: 'Recent home reading.',
              type: PatientHistoryEntryType.Observation,
              value: {
                type: PatientObservationValueType.Text,
                value: '160/90 mmHg',
              },
            },
            {
              conclusion: 'Gestational diabetes confirmed.',
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
              sensitivity: PatientDataSensitivity.Standard,
              status: PatientInvestigationStatus.Final,
              summary: 'Oral glucose tolerance test completed.',
              type: PatientHistoryEntryType.Investigation,
            },
            {
              id: 'cardiac-repair',
              outcome: 'Good initial recovery.',
              procedure: { display: 'Surgical cardiac repair' },
              sensitivity: PatientDataSensitivity.Standard,
              summary: 'Cardiac defect surgically repaired.',
              type: PatientHistoryEntryType.Procedure,
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Observations, investigations and procedures',
      }),
    ).toBeTruthy();
    expect(screen.getByText('Home blood pressure')).toBeTruthy();
    expect(screen.getByText('160/90 mmHg')).toBeTruthy();
    expect(screen.getByText('Oral glucose tolerance test')).toBeTruthy();
    expect(screen.getByText('Fasting plasma glucose')).toBeTruthy();
    expect(screen.getByText('5.9 mmol/L')).toBeTruthy();
    expect(screen.getByText('Gestational diabetes confirmed.')).toBeTruthy();
    expect(screen.getByText('Surgical cardiac repair')).toBeTruthy();
    expect(screen.getByText('Good initial recovery.')).toBeTruthy();
  });

  it('describes absent durable records without implying no episode data', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.ObservationsInvestigationsAndProcedures}
        patient={{ ...patient, historyEntries: [] }}
      />,
    );

    expect(screen.getByText('No durable observations recorded')).toBeTruthy();
    expect(screen.getByText('No durable investigations recorded')).toBeTruthy();
    expect(screen.getByText('No durable procedures recorded')).toBeTruthy();
    expect(screen.getByText(/scenario layer supplies them/)).toBeTruthy();
  });

  it('renders durable encounters and referral transitions', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.CareEncountersAndTransitions}
        patient={{
          ...patient,
          historyEntries: [
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
        }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Care encounters and transitions' }),
    ).toBeTruthy();
    expect(
      screen.getByText('Progressed to community mental health care.'),
    ).toBeTruthy();
    expect(
      screen.getByText('Transferred from acute assessment to community care.'),
    ).toBeTruthy();
    expect(screen.getByText('Referred for specialist care.')).toBeTruthy();
    expect(screen.getByText('Primary care')).toBeTruthy();
    expect(screen.getByText('Specialist service')).toBeTruthy();
    expect(screen.getByText('Specialist care established.')).toBeTruthy();
  });

  it('does not infer a current encounter or referral for Esther', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.CareEncountersAndTransitions}
        patient={patient}
      />,
    );

    expect(
      screen.getByText('No durable care encounters recorded'),
    ).toBeTruthy();
    expect(
      screen.getByText('No durable referrals or care transitions recorded'),
    ).toBeTruthy();
    expect(screen.queryByText(/Acute Stroke Admission/)).toBeNull();
  });
});
