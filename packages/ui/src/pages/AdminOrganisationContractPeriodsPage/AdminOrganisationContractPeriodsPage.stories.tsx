import type { Meta, StoryObj } from '@storybook/react-vite';

import { OrganisationDetailsRail } from '../../organisms';

import { AdminOrganisationContractPeriodsPage } from './AdminOrganisationContractPeriodsPage.component';

const organisation = {
  name: 'Northbridge University',
  slug: 'northbridge-university',
  status: 'active',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-15T11:00:00.000Z',
};

const meta = {
  title: 'Pages/AdminOrganisationContractPeriodsPage',
  component: AdminOrganisationContractPeriodsPage,
  args: {
    contractPeriods: [
      {
        id: 'contract-id',
        startsOn: '2026-09-01',
        endsOn: '2027-08-31',
        seats: { allowed: 250, activated: 34, remaining: 216 },
      },
    ],
    onPageChange: () => undefined,
    organisationName: organisation.name,
    page: 1,
    pageSize: 20,
    totalRecords: 1,
  },
  render: (args) => (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)] lg:gap-14">
      <OrganisationDetailsRail organisation={organisation} />
      <AdminOrganisationContractPeriodsPage {...args} />
    </div>
  ),
} satisfies Meta<typeof AdminOrganisationContractPeriodsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { args: { contractPeriods: [], loading: true } };

export const Empty: Story = {
  args: { contractPeriods: [], totalRecords: 0 },
};
