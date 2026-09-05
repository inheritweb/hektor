import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatientProfileDetailPage } from './PatientProfileDetailPage.component';

const meta = {
  title: 'Pages/PatientProfileDetailPage',
  component: PatientProfileDetailPage,
  args: {
    createScenarioHref: '#create-scenario',
    previewHref: '#ehr-preview',
    scenarios: [
      {
        id: 'e1cd82e8-745b-4f25-b828-a62d98a9fc2d',
        title: 'Acute ischaemic stroke admission',
        description:
          'Esther is admitted to the stroke unit following sudden left-sided weakness, facial droop and slurred speech.',
        careSetting: 'acute_inpatient',
        intendedClinicalAudiences: [
          'nursing',
          'pharmacy',
          'medicine',
          'allied_health',
        ],
        status: 'draft',
        patientProfileVersion: { versionNumber: 1 },
        beginningStep: { title: 'Admission to the stroke unit' },
        editHref: '#edit-scenario',
      },
    ],
    profile: {
      displayName: 'Amina Warsame',
      dateOfBirth: '1948-04-12',
      versionNumber: 1,
      versionState: 'superseded',
      versions: [
        {
          id: 'f88d4513-5d70-4d27-a93d-8b4ce9df8b2c',
          versionNumber: 3,
          state: 'published',
        },
        {
          id: '40b99356-b91a-4814-ba50-754e487fb9a5',
          versionNumber: 2,
          state: 'superseded',
        },
        {
          id: '4556da1a-b03f-4632-aa46-ef4a70eaa30d',
          versionNumber: 1,
          state: 'superseded',
        },
      ],
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
