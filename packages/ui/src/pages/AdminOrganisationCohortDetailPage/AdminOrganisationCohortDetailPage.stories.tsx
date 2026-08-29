import type { Meta, StoryObj } from '@storybook/react-vite';

import { OrganisationDetailsRail } from '../../organisms';

import { AdminOrganisationCohortDetailPage } from './AdminOrganisationCohortDetailPage.component';

const organisation = {
  name: 'Northbridge University',
  slug: 'northbridge-university',
  status: 'active',
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-15T11:00:00.000Z',
};

const meta = {
  title: 'Pages/AdminOrganisationCohortDetailPage',
  component: AdminOrganisationCohortDetailPage,
  args: {
    cohort: {
      id: 'cohort-id',
      name: 'September 2026',
      startsOn: '2026-09-01',
      endsOn: '2029-08-31',
      status: 'active',
      groups: [
        { id: 'group-one', name: 'Clinical Practice A', status: 'active' },
        { id: 'group-two', name: 'Study Group B', status: 'active' },
      ],
      learners: [
        {
          id: 'membership-id',
          platformStatus: 'active',
          role: 'learner',
          seatStatus: 'allocated',
          status: 'active',
          user: {
            id: 'user-id',
            displayName: 'Maya Patel',
            email: 'maya.patel@northbridge.example',
          },
        },
      ],
    },
    getUserHref: (learner) => `/admin/users/${learner.user.id}`,
  },
  render: (args) => (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)] lg:gap-14">
      <OrganisationDetailsRail organisation={organisation} />
      <AdminOrganisationCohortDetailPage {...args} />
    </div>
  ),
} satisfies Meta<typeof AdminOrganisationCohortDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { cohort: { ...meta.args.cohort, groups: [], learners: [] } },
};
