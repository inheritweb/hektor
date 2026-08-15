import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProfilePage } from './ProfilePage.component';

const meta = {
  title: 'Pages/ProfilePage',
  component: ProfilePage,
  args: {
    createdAt: '2025-09-12T10:00:00.000Z',
    displayName: 'Alex Morgan',
    email: 'alex@example.com',
    platformRole: 'admin',
    identities: [
      {
        id: '4f65df81-97d1-4be1-9402-549f655142a6',
        provider: 'google',
        email: 'alex@example.com',
        createdAt: '2025-09-12T10:00:00.000Z',
        lastSignInAt: '2026-08-15T09:30:00.000Z',
      },
      {
        id: 'da870963-538b-4439-9b44-ee0a1320a46e',
        provider: 'azure',
        email: 'a.morgan@northshire.ac.uk',
        createdAt: '2025-10-01T11:00:00.000Z',
      },
    ],
    memberships: [
      {
        id: 'c7241726-c6f5-4902-9e08-e1a9672d6fd3',
        organisation: {
          id: '161b39a7-6302-4582-8681-79afe657c9ca',
          name: 'Northshire University',
        },
        role: 'tutor',
        status: 'active',
        provisioningStatus: 'active',
        institutionalUserName: 'a.morgan@northshire.ac.uk',
      },
    ],
  },
} satisfies Meta<typeof ProfilePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithOrganisation: Story = {};

export const PersonalAdmin: Story = { args: { memberships: [] } };

export const PersonalOnly: Story = {
  args: { memberships: [], platformRole: undefined },
};
