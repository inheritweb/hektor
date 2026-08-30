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
        communication: {
          languages: [
            { language: { display: 'Somali' } },
            { language: { display: 'English' } },
          ],
          accessibilityNeeds: [
            {
              id: 'hearing',
              summary: 'Allow additional time for conversation.',
            },
          ],
        },
        background: [
          {
            id: 'family',
            summary: 'Lives near close family',
            details: 'Family members are actively involved in care.',
          },
        ],
        problems: [
          {
            id: 'stroke',
            problem: { display: 'Stroke' },
            details: 'Recent change in mobility and communication.',
          },
        ],
        allergies: [],
        baselineMedications: [
          {
            id: 'aspirin',
            medication: { display: 'Aspirin' },
            dose: '75 mg',
            frequency: 'Once daily',
          },
        ],
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
