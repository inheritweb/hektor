import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatientProfilesPage } from './PatientProfilesPage.component';

const meta = {
  title: 'Pages/PatientProfilesPage',
  component: PatientProfilesPage,
  args: {
    getProfileHref: ({ id }) => `/admin/patient-profiles/${id}`,
    profiles: [
      {
        id: 'profile-one',
        displayName: 'Amina Warsame',
        dateOfBirth: '1948-04-12',
        versionState: 'draft',
        synopsis:
          'An older adult whose story supports culturally responsive, person-centred care.',
        lifeStage: 'older_adult',
        specialties: ['stroke', 'interprofessional'],
      },
      {
        id: 'profile-two',
        displayName: 'Adam Marsden',
        dateOfBirth: '1987-11-03',
        versionState: 'draft',
        synopsis:
          'An adult living with a long-term condition and changing care needs.',
        lifeStage: 'adult',
        specialties: ['diabetes'],
      },
    ],
  },
} satisfies Meta<typeof PatientProfilesPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { profiles: [] } };

export const Loading: Story = { args: { loading: true } };

export const Error: Story = {
  args: { error: 'Unable to load patient profiles.' },
};
