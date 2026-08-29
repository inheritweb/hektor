import type { Meta, StoryObj } from '@storybook/react-vite';

import { OrganisationDetailsRail } from '../../organisms';

import { AdminOrganisationUsersPage } from './AdminOrganisationUsersPage.component';

const organisation = {
  name: 'Northbridge University',
  slug: 'northbridge-university',
  status: 'active',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-15T11:00:00.000Z',
};

const meta = {
  title: 'Pages/AdminOrganisationUsersPage',
  component: AdminOrganisationUsersPage,
  args: {
    onPageChange: () => undefined,
    organisationName: 'Northbridge University',
    page: 1,
    pageSize: 20,
    totalRecords: 2,
    users: [
      {
        id: '1',
        user: {
          displayName: 'Maya Patel',
          email: 'maya.patel@northbridge.example',
        },
        role: 'org_admin',
        status: 'active',
        seatStatus: 'not_allocated',
        platformStatus: 'active',
      },
      {
        id: '2',
        user: {
          displayName: 'Sam Rivera',
          email: 'sam.rivera@northbridge.example',
        },
        role: 'learner',
        status: 'active',
        seatStatus: 'allocated',
        platformStatus: 'suspended',
      },
    ],
  },
  render: (args) => (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)] lg:gap-14">
      <OrganisationDetailsRail organisation={organisation} />
      <AdminOrganisationUsersPage {...args} />
    </div>
  ),
} satisfies Meta<typeof AdminOrganisationUsersPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { args: { loading: true, users: [] } };

export const Empty: Story = { args: { totalRecords: 0, users: [] } };
