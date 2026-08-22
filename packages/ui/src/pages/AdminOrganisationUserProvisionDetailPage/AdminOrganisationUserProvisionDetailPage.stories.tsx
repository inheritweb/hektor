import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminOrganisationUserProvisionDetailPage } from './AdminOrganisationUserProvisionDetailPage.component';

const meta = {
  title: 'Pages/AdminOrganisationUserProvisionDetailPage',
  component: AdminOrganisationUserProvisionDetailPage,
  args: {
    getGroupHref: (group) => `/groups/${group.id}`,
    getUserHref: (user) => `/users/${user.id}`,
    provision: {
      cohort: { id: 'cohort', name: 'September 2026' },
      createdAt: '2026-08-15T10:00:00.000Z',
      groups: [{ id: 'group', name: 'Clinical Practice A' }],
      lastSynchronizedAt: '2026-08-16T10:00:00.000Z',
      linkedAt: '2026-08-16T11:00:00.000Z',
      linkedUser: {
        id: 'user',
        displayName: 'Maya Patel',
        email: 'maya@example.com',
      },
      organisationUserId: 'membership',
      provisionedDisplayName: 'Maya P.',
      provisionedFamilyName: 'Patel',
      provisionedGivenName: 'Maya',
      provisionedRole: 'learner',
      provisionedUserName: 'maya@northbridge.example',
      provisioningMethod: 'scim',
      sourceExternalId: 'entra-user-123',
      status: 'linked',
      updatedAt: '2026-08-16T11:00:00.000Z',
    },
  },
} satisfies Meta<typeof AdminOrganisationUserProvisionDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Linked: Story = {};

export const Pending: Story = {
  args: {
    actions: [
      { label: 'Match existing account', onSelect: () => undefined },
      {
        label: 'Revoke',
        onSelect: () => undefined,
        variant: 'destructive',
      },
    ],
    provision: {
      ...meta.args.provision,
      linkedAt: undefined,
      linkedUser: undefined,
      organisationUserId: undefined,
      status: 'pending',
    },
  },
};
