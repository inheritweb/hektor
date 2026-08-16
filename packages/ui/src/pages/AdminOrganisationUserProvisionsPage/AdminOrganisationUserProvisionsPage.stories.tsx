import type { Meta, StoryObj } from '@storybook/react-vite';

import { OrganisationDetailsRail } from '../../organisms';

import { AdminOrganisationUserProvisionsPage } from './AdminOrganisationUserProvisionsPage.component';

const meta = {
  title: 'Pages/AdminOrganisationUserProvisionsPage',
  component: AdminOrganisationUserProvisionsPage,
  args: {
    onPageChange: () => undefined,
    organisationName: 'Northbridge University',
    page: 1,
    pageSize: 20,
    totalRecords: 2,
    provisions: [
      {
        id: '1',
        provisionedDisplayName: 'Maya Patel',
        provisionedUserName: 'maya.patel@northbridge.example',
        provisionedRole: 'org_admin',
        provisioningMethod: 'scim',
        status: 'pending',
      },
      {
        id: '2',
        provisionedDisplayName: 'Sam Rivera',
        provisionedUserName: 'sam.rivera@northbridge.example',
        provisionedRole: 'learner',
        provisioningMethod: 'csv',
        status: 'pending',
      },
    ],
  },
  render: (args) => (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)] lg:gap-14">
      <OrganisationDetailsRail
        organisation={{
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-15T11:00:00.000Z',
        }}
      />
      <AdminOrganisationUserProvisionsPage {...args} />
    </div>
  ),
} satisfies Meta<typeof AdminOrganisationUserProvisionsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { args: { loading: true, provisions: [] } };

export const Empty: Story = {
  args: { totalRecords: 0, provisions: [] },
};
