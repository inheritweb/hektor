import type { Meta, StoryObj } from '@storybook/react-vite';

import { OrganisationDetailsRail } from '../../organisms';

import { AdminOrganisationDetailPage } from './AdminOrganisationDetailPage.component';

const organisation = {
  id: '10000000-0000-4000-8000-000000000001',
  name: 'Northbridge University',
  slug: 'northbridge-university',
  status: 'active',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-15T11:00:00.000Z',
  usersSummary: {
    total: 42,
    learners: 34,
    tutors: 6,
    organisationAdmins: 2,
    suspended: 1,
  },
  userProvisionsSummary: {
    total: 4,
    pending: 4,
    inactive: 0,
    failed: 0,
  },
  contractPeriods: [
    {
      id: '1',
      startsOn: '2026-09-01',
      endsOn: '2027-08-31',
      seats: { allowed: 250, activated: 34, remaining: 216 },
    },
  ],
  cohorts: [
    {
      id: '1',
      name: 'September 2026',
      startsOn: '2026-09-01',
      endsOn: '2029-08-31',
      status: 'active',
    },
  ],
  groups: [
    { id: '1', name: 'Clinical Practice A', status: 'active' },
    { id: '2', name: 'Teaching Staff', status: 'active' },
  ],
};

const meta = {
  title: 'Pages/AdminOrganisationDetailPage',
  component: AdminOrganisationDetailPage,
  args: {
    cohortsHref: `/admin/organisations/${organisation.id}/cohorts`,
    contractPeriodsHref: `/admin/organisations/${organisation.id}/contract-periods`,
    groupsHref: `/admin/organisations/${organisation.id}/groups`,
    organisation,
    provisionsHref: `/admin/organisations/${organisation.id}/provisioned-users`,
    usersHref: `/admin/organisations/${organisation.id}/users`,
  },
  render: (args) => (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)] lg:gap-14">
      <OrganisationDetailsRail organisation={args.organisation} />
      <AdminOrganisationDetailPage {...args} />
    </div>
  ),
} satisfies Meta<typeof AdminOrganisationDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCollections: Story = {
  args: {
    organisation: {
      ...organisation,
      cohorts: [],
      contractPeriods: [],
      groups: [],
      usersSummary: {
        total: 0,
        learners: 0,
        tutors: 0,
        organisationAdmins: 0,
        suspended: 0,
      },
      userProvisionsSummary: {
        total: 0,
        pending: 0,
        inactive: 0,
        failed: 0,
      },
    },
  },
};
