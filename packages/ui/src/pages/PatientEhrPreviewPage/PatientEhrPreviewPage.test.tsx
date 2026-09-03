import {
  EhrSectionType,
  PatientAllergyRecordStatus,
  PatientCareSetting,
  PatientClinicalDocumentType,
  PatientDataSensitivity,
  PatientHistoryDatePrecision,
  PatientHistoryEntryType,
  PatientHistoricalCarePlanCategory,
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
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  safeguarding: [],
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
              category: PatientHistoricalCarePlanCategory.CareAndSupport,
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

  it('renders an authored advance and emergency care plan', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.EndOfLifeAndEmergencyCarePlanning}
        patient={{
          ...patient,
          historyEntries: [
            {
              category:
                PatientHistoricalCarePlanCategory.AdvanceAndEmergencyCare,
              evaluation:
                'ReSPECT and DNACPR decisions remain in progress and unsigned.',
              goals: ['Keep Emma comfortable and unafraid'],
              id: 'advance-care-plan',
              interventions: ['Continue multidisciplinary CYPACP discussions'],
              need: 'Parallel planning for supportive and palliative care.',
              sensitivity: PatientDataSensitivity.Restricted,
              status: PatientHistoricalCarePlanStatus.ActiveAtBoundary,
              summary:
                "Children and Young People's Advance Care Plan is in progress.",
              type: PatientHistoryEntryType.CarePlan,
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'End-of-life and emergency care planning',
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Children and Young People's Advance Care Plan is in progress.",
      ),
    ).toBeTruthy();
    expect(screen.getByText('Keep Emma comfortable and unafraid')).toBeTruthy();
    expect(
      screen.getByText('Continue multidisciplinary CYPACP discussions'),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'ReSPECT and DNACPR decisions remain in progress and unsigned.',
      ),
    ).toBeTruthy();
  });

  it('does not infer resuscitation or escalation decisions from an absent plan', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.EndOfLifeAndEmergencyCarePlanning}
        patient={patient}
      />,
    );

    expect(
      screen.getByText(
        'No durable end-of-life or emergency care plan is recorded in this base Patient Profile.',
      ),
    ).toBeTruthy();
    expect(screen.getByText(/not a clinical conclusion/)).toBeTruthy();
  });

  it('renders only explicitly recorded safeguarding information', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.Safeguarding}
        patient={{
          ...patient,
          safeguarding: [
            {
              details: 'Record requires review with the safeguarding lead.',
              id: 'exploitation-vulnerability',
              sensitivity: PatientDataSensitivity.Restricted,
              summary: 'Vulnerability to exploitation is recorded.',
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Safeguarding' })).toBeTruthy();
    expect(
      screen.getByText('Vulnerability to exploitation is recorded.'),
    ).toBeTruthy();
    expect(
      screen.getByText('Record requires review with the safeguarding lead.'),
    ).toBeTruthy();
    expect(screen.queryByText('Lives independently')).toBeNull();
  });

  it('does not infer that an absent safeguarding record means no concern', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.Safeguarding}
        patient={patient}
      />,
    );

    expect(
      screen.getByText(
        'No durable safeguarding information is recorded in this base Patient Profile.',
      ),
    ).toBeTruthy();
    expect(screen.getByText(/does not assert that safeguarding/)).toBeTruthy();
  });

  it('renders authored clinical notes and handovers as professional communication', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.MultiProfessionalCommunication}
        patient={{
          ...patient,
          historyEntries: [
            {
              author: {
                name: 'Gemma Walsh',
                role: "Children's community nurse",
                service: 'Community nursing team',
              },
              body: 'Situation stable. Continue the agreed symptom plan and contact oncology if pain escalates.',
              documentType: PatientClinicalDocumentType.Handover,
              id: 'community-handover',
              recordedOn: {
                precision: PatientHistoryDatePrecision.Day,
                value: '2026-05-20',
              },
              sensitivity: PatientDataSensitivity.Restricted,
              summary: 'Community team handover completed.',
              title: 'Community nursing handover',
              type: PatientHistoryEntryType.ClinicalDocument,
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Multi-professional communication' }),
    ).toBeTruthy();
    expect(screen.getByText('Community nursing handover')).toBeTruthy();
    expect(screen.getByText('Community team handover completed.')).toBeTruthy();
    expect(screen.getByText(/Situation stable/)).toBeTruthy();
    expect(screen.getByText(/Gemma Walsh/)).toBeTruthy();
  });

  it('does not present a care team or referral as an authored communication', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.MultiProfessionalCommunication}
        patient={patient}
      />,
    );

    expect(
      screen.getByText(
        'No durable multi-professional clinical note or handover is recorded in this base Patient Profile.',
      ),
    ).toBeTruthy();
    expect(screen.getByText(/A scenario may add current notes/)).toBeTruthy();
  });

  it('renders letters and correspondence without duplicating handovers', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.DocumentsAndCorrespondence}
        patient={{
          ...patient,
          historyEntries: [
            {
              author: {
                name: 'Dr Priya Chandran',
                role: 'Consultant Clinical Oncologist',
                service: 'Clinical Oncology',
              },
              body: 'Dear Dr Marsh, the patient has completed primary treatment and has been referred for rehabilitation follow-up.',
              documentType: PatientClinicalDocumentType.Letter,
              id: 'oncology-clinic-letter',
              recordedOn: {
                precision: PatientHistoryDatePrecision.Day,
                value: '2026-02-03',
              },
              sensitivity: PatientDataSensitivity.Standard,
              summary: 'End-of-treatment oncology letter sent to primary care.',
              title: 'Oncology end-of-treatment letter',
              type: PatientHistoryEntryType.ClinicalDocument,
            },
            {
              body: 'This handover belongs in professional communication.',
              documentType: PatientClinicalDocumentType.Handover,
              id: 'ward-handover',
              sensitivity: PatientDataSensitivity.Restricted,
              summary: 'Ward handover.',
              title: 'Ward handover',
              type: PatientHistoryEntryType.ClinicalDocument,
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Documents / correspondence' }),
    ).toBeTruthy();
    expect(screen.getByText('Oncology end-of-treatment letter')).toBeTruthy();
    expect(
      screen.getByText(
        'End-of-treatment oncology letter sent to primary care.',
      ),
    ).toBeTruthy();
    expect(screen.getByText(/Dear Dr Marsh/)).toBeTruthy();
    expect(screen.getByText(/Dr Priya Chandran/)).toBeTruthy();
    expect(screen.queryByText('Ward handover')).toBeNull();
  });

  it('describes an absent document record without implying no scenario documents', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection={EhrSectionType.DocumentsAndCorrespondence}
        patient={patient}
      />,
    );

    expect(
      screen.getByText(
        'No durable document or correspondence is recorded in this base Patient Profile.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(/A scenario may add current referral letters/),
    ).toBeTruthy();
  });

  it('uses resolved scenario section labels and identifies the current step', async () => {
    const user = userEvent.setup();
    const onScenarioStepChange = vi.fn();
    render(
      <PatientEhrPreviewPage
        ehrConfiguration={{
          sections: [
            {
              id: EhrSectionType.StandardisedAssessmentsAndRiskScreening,
              label: 'Presenting history and neurological assessment',
              order: 10,
              type: EhrSectionType.StandardisedAssessmentsAndRiskScreening,
            },
          ],
        }}
        exitHref="#exit"
        onScenarioStepChange={onScenarioStepChange}
        patient={patient}
        scenarioPreview={{
          currentStepId: '563b99e4-6af4-49e4-90b8-e16eb676d27e',
          currentStepTitle: 'Admission to the stroke unit',
          status: 'draft',
          steps: [
            {
              id: '563b99e4-6af4-49e4-90b8-e16eb676d27e',
              kind: 'beginning',
              title: 'Admission to the stroke unit',
            },
            {
              id: 'fc7c473b-78cb-4b38-9e5d-06a9e17437e1',
              kind: 'progression',
              title: 'Swallowing and communication review',
            },
          ],
          title: 'Acute ischaemic stroke admission',
        }}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: /Presenting history and neurological assessment/,
      }),
    ).toBeTruthy();

    await user.click(
      screen.getByRole('button', { name: 'Open simulation tools' }),
    );
    expect(screen.getByText('Acute ischaemic stroke admission')).toBeTruthy();
    expect(
      screen.getAllByText('Admission to the stroke unit').length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Beginning').length).toBeGreaterThan(0);
    expect(screen.queryByText('Step 10')).toBeNull();

    await user.click(
      screen.getByRole('button', {
        name: 'Step 2: Swallowing and communication review',
      }),
    );
    expect(onScenarioStepChange).toHaveBeenCalledWith(
      'fc7c473b-78cb-4b38-9e5d-06a9e17437e1',
    );
  });
});
