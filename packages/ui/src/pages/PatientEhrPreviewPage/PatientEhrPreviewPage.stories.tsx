import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatientEhrPreviewPage } from './PatientEhrPreviewPage.component';

const meta = {
  title: 'Pages/PatientEhrPreviewPage',
  component: PatientEhrPreviewPage,
  parameters: { layout: 'fullscreen' },
  args: {
    exitHref: '#patient-profile',
    patient: {
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
      identifiers: [
        {
          display: 'Hektor patient number',
          value: 'SIM-HKT-37194',
        },
      ],
      organisationName: 'Jean McFarlane Trust',
      recordContext: 'Stroke Unit — Simulated Practice Placement',
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
