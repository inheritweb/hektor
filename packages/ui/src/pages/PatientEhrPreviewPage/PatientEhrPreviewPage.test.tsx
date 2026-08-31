import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import {
  PatientEhrPreviewPage,
  type PatientEhrPreviewViewModel,
} from './PatientEhrPreviewPage.component';

const patient = {
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
  identifiers: [{ display: 'Hektor patient number', value: 'SIM-HKT-37194' }],
  organisationName: 'Jean McFarlane Trust',
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
  it('switches accessibly from patient details to communication and relationships', async () => {
    const user = userEvent.setup();
    render(<PatientEhrPreviewPage exitHref="#exit" patient={patient} />);

    expect(
      screen.getByRole('heading', { name: 'A — Patient Details' }),
    ).toBeTruthy();

    const communicationNavigation = screen.getByRole('button', {
      name: /Communication & relationships/,
    });
    await user.click(communicationNavigation);

    const heading = screen.getByRole('heading', {
      name: 'B — Communication & relationships',
    });
    expect(heading).toBeTruthy();
    expect(document.activeElement).toBe(heading);
    expect(communicationNavigation.getAttribute('aria-current')).toBe('page');
    expect(screen.getByText('French')).toBeTruthy();
    expect(screen.getByText('Allow additional processing time.')).toBeTruthy();
    expect(screen.getByText('Tasha Jenkins')).toBeTruthy();
  });

  it('distinguishes an empty communication and relationships record', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection="communication-relationships"
        patient={{
          ...patient,
          communication: {
            accessibilityNeeds: [],
            languages: [],
            preferences: [],
          },
          relationships: [],
        }}
      />,
    );

    expect(screen.getAllByText('None recorded')).toHaveLength(4);
    expect(
      screen.queryByText('Communication adjustments are recorded.'),
    ).toBeNull();
  });

  it('keeps active allergies visible and switches to the complete safety section', async () => {
    const user = userEvent.setup();
    render(<PatientEhrPreviewPage exitHref="#exit" patient={patient} />);

    expect(screen.getByText(/ALLERGIES — PENICILLIN/)).toBeTruthy();

    const safetyNavigation = screen.getByRole('button', {
      name: /Problems & allergies/,
    });
    await user.click(safetyNavigation);

    const heading = screen.getByRole('heading', {
      name: 'C — Problems & allergies',
    });
    expect(document.activeElement).toBe(heading);
    expect(screen.getByText('Generalised urticaria')).toBeTruthy();
    expect(
      screen.getByText('Recurrent right shoulder instability'),
    ).toBeTruthy();
  });

  it('describes empty allergy data without asserting no known allergies', () => {
    render(
      <PatientEhrPreviewPage
        exitHref="#exit"
        initialSection="problems-allergies"
        patient={{ ...patient, allergies: [] }}
      />,
    );

    expect(screen.getByText('No allergies recorded')).toBeTruthy();
    expect(screen.queryByText(/No known allergies/i)).toBeNull();
  });
});
