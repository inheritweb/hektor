import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatientEhrPreviewPage } from './PatientEhrPreviewPage.component';

const meta = {
  title: 'Pages/PatientEhrPreviewPage',
  component: PatientEhrPreviewPage,
  parameters: { layout: 'fullscreen' },
  args: {
    exitHref: '#patient-profile',
    patient: {
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

export const CommunicationAndRelationships: Story = {
  args: { initialSection: 'communication-relationships' },
};

export const NarrowCommunicationAndRelationships: Story = {
  args: { initialSection: 'communication-relationships' },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const ProblemsAndAllergies: Story = {
  args: { initialSection: 'problems-allergies' },
};

export const NarrowProblemsAndAllergies: Story = {
  args: { initialSection: 'problems-allergies' },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
