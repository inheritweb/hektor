import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminOrganisationGroupDetailPage } from './AdminOrganisationGroupDetailPage.component';

const meta = {
  title: 'Pages/AdminOrganisationGroupDetailPage',
  component: AdminOrganisationGroupDetailPage,
  args: {
    group: {
      name: 'Clinical Practice A',
      status: 'active',
      provisioningMethod: 'scim',
      sourceExternalId: 'entra-group-123',
      cohort: { name: 'September 2026' },
      users: [
        {
          id: 'member',
          role: 'learner',
          status: 'active',
          user: {
            id: 'user',
            displayName: 'Maya Patel',
            email: 'maya@northbridge.example',
          },
        },
      ],
      provisionedUsers: [
        {
          id: 'provision',
          provisioningMethod: 'scim',
          provisionedDisplayName: 'Sam Rivera',
          provisionedUserName: 'sam@northbridge.example',
          provisionedRole: 'learner',
          status: 'pending',
        },
      ],
    },
    getUserHref: (item) => `/admin/users/${item.user.id}`,
  },
} satisfies Meta<typeof AdminOrganisationGroupDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { group: { ...meta.args.group, users: [], provisionedUsers: [] } },
};
