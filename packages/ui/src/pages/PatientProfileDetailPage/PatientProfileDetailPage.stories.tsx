import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatientProfileDetailPage } from './PatientProfileDetailPage.component';

const meta = {
  title: 'Pages/PatientProfileDetailPage',
  component: PatientProfileDetailPage,
  args: {
    profile: {
      displayName: 'Amina Warsame',
      dateOfBirth: '1948-04-12',
      versionNumber: 1,
      versionState: 'draft',
      synopsis:
        'An older adult whose story supports culturally responsive, person-centred care.',
      document: {
        identity: {
          givenNames: ['Amina'],
          familyName: 'Warsame',
          dateOfBirth: '1948-04-12',
          sexAtBirth: { status: 'known', value: 'female' },
        },
        identifiers: [
          {
            id: 'patient-number',
            display: 'Hektor patient number',
            value: 'SIM-HKT-15238',
            issuer: 'Hektor',
          },
        ],
        demographics: {
          ethnicity: {
            status: 'known',
            value: { display: 'Black African, Somali heritage' },
          },
          faithOrBelief: {
            status: 'known',
            value: { display: 'Muslim' },
          },
        },
        communication: {
          languages: [
            { id: 'somali', language: { display: 'Somali' } },
            { id: 'english', language: { display: 'English' } },
          ],
          preferences: [],
          accessibilityNeeds: [
            {
              id: 'hearing',
              summary: 'Allow additional time for conversation.',
            },
          ],
        },
        contact: {
          address: {
            lines: ['12 Beresford Road'],
            city: 'Manchester',
            postalCode: 'M16 8NG',
            country: 'United Kingdom',
          },
        },
        relationships: [
          {
            id: 'yusuf',
            name: 'Yusuf Warsame',
            relationship: { display: 'Husband' },
            roles: ['next_of_kin'],
          },
        ],
        background: [
          {
            id: 'family',
            category: 'family',
            summary: 'Lives near close family',
            details: 'Family members are actively involved in care.',
            sensitivity: 'standard',
          },
        ],
        problems: [
          {
            id: 'stroke',
            problem: { display: 'Stroke' },
            clinicalStatus: 'active',
            details: 'Recent change in mobility and communication.',
          },
        ],
        allergies: [],
        baselineMedications: [
          {
            id: 'aspirin',
            medication: { display: 'Aspirin' },
            status: 'active',
            dose: '75 mg',
            frequency: 'Once daily',
          },
        ],
        history: {
          entries: [
            {
              id: 'diabetes-review',
              type: 'assessment',
              summary: 'Diabetes review completed before the current scenario.',
              sensitivity: 'standard',
              assessment: { display: 'Diabetes review' },
              outcome: 'Treatment continued without change.',
            },
            {
              id: 'historic-weight',
              type: 'observation',
              summary: 'Weight recorded at a previous appointment.',
              sensitivity: 'standard',
              observation: { display: 'Body weight' },
              value: { type: 'quantity', value: 78, unit: 'kg' },
            },
          ],
        },
      },
    },
  },
} satisfies Meta<typeof PatientProfileDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DraftPreview: Story = {};

export const Published: Story = {
  args: { profile: { ...meta.args.profile, versionState: 'published' } },
};
