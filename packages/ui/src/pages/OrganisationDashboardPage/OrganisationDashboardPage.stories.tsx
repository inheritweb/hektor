import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrganisationDashboardPage } from './OrganisationDashboardPage.component';

const meta = {
  title: 'Pages/OrganisationDashboardPage',
  component: OrganisationDashboardPage,
  args: {
    cohortCount: 3,
    groupCount: 7,
    organisationName: 'Northbridge University',
    provisionCount: 14,
    userCount: 53,
  },
} satisfies Meta<typeof OrganisationDashboardPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { args: { loading: true } };
