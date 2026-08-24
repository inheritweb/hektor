import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminOrganisationMembershipDetailPage } from './AdminOrganisationMembershipDetailPage.component';

const meta = {
  title: 'Pages/AdminOrganisationMembershipDetailPage',
  component: AdminOrganisationMembershipDetailPage,
  args: {
    editHref: '#edit',
    getGroupHref: (id: string) => `#group-${id}`,
    membership: {
      id: 'membership-1',
      role: 'learner',
      status: 'active',
      user: {
        id: 'user-1',
        displayName: 'Isla Phillips',
        email: 'isla@example.edu',
      },
      cohort: { id: 'cohort-1', name: 'Autumn 2026' },
      groups: [{ id: 'group-1', name: 'Physics A', status: 'active' }],
      provisioning: { id: 'provision-1', method: 'scim', status: 'linked' },
      seatActivation: {
        activatedAt: '2026-08-24T10:00:00.000Z',
        contractPeriodId: 'contract-1',
      },
    },
    provisionHref: '#provision',
  },
} satisfies Meta<typeof AdminOrganisationMembershipDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
