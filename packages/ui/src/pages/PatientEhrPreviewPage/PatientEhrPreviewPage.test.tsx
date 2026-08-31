import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import {
  PatientEhrPreviewPage,
  type PatientEhrPreviewViewModel,
} from './PatientEhrPreviewPage.component';

const patient = {
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
});
