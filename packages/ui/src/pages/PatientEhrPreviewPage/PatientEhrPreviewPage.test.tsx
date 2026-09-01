import { EhrSectionType, PatientAllergyRecordStatus } from '@hektor/types';
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
});
