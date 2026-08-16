import type { Meta, StoryObj } from '@storybook/react-vite';

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
    linked: 38,
    awaitingAccountLinking: 4,
    learners: 34,
    tutors: 6,
    organisationAdmins: 2,
    suspended: 1,
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
    organisation,
    usersHref: `/admin/organisations/${organisation.id}/users`,
  },
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
        linked: 0,
        awaitingAccountLinking: 0,
        learners: 0,
        tutors: 0,
        organisationAdmins: 0,
        suspended: 0,
      },
    },
  },
};
