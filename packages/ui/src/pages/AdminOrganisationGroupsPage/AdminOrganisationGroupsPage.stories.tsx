import type { Meta, StoryObj } from '@storybook/react-vite';

import { OrganisationDetailsRail } from '../../organisms';

import { AdminOrganisationGroupsPage } from './AdminOrganisationGroupsPage.component';

const organisation = {
  name: 'Northbridge University',
  slug: 'northbridge-university',
  status: 'active',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-15T11:00:00.000Z',
};

const meta = {
  title: 'Pages/AdminOrganisationGroupsPage',
  component: AdminOrganisationGroupsPage,
  args: {
    groups: [
      { id: 'local', name: 'Teaching Staff', status: 'active' },
      {
        id: 'external',
        name: 'Clinical Practice A',
        status: 'active',
        provisioningMethod: 'scim',
        sourceExternalId: 'entra-group-123',
      },
    ],
    onPageChange: () => undefined,
    organisationName: organisation.name,
    page: 1,
    pageSize: 20,
    totalRecords: 2,
  },
  render: (args) => (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)] lg:gap-14">
      <OrganisationDetailsRail organisation={organisation} />
      <AdminOrganisationGroupsPage {...args} />
    </div>
  ),
} satisfies Meta<typeof AdminOrganisationGroupsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { args: { groups: [], loading: true } };

export const Empty: Story = { args: { groups: [], totalRecords: 0 } };
