import type { Meta, StoryObj } from '@storybook/react-vite';

import { OrganisationDetailsRail } from '../../organisms';

import { AdminOrganisationCohortsPage } from './AdminOrganisationCohortsPage.component';

const organisation = {
  name: 'Northbridge University',
  slug: 'northbridge-university',
  status: 'active',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-15T11:00:00.000Z',
};

const meta = {
  title: 'Pages/AdminOrganisationCohortsPage',
  component: AdminOrganisationCohortsPage,
  args: {
    cohorts: [
      {
        id: 'cohort-id',
        name: 'September 2026',
        startsOn: '2026-09-01',
        endsOn: '2029-08-31',
        status: 'active',
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
      <AdminOrganisationCohortsPage {...args} />
    </div>
  ),
} satisfies Meta<typeof AdminOrganisationCohortsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { args: { cohorts: [], loading: true } };

export const Empty: Story = { args: { cohorts: [], totalRecords: 0 } };
