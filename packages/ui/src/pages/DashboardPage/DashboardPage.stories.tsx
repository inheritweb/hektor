import type { Meta, StoryObj } from '@storybook/react-vite';

import { DashboardPage } from './DashboardPage.component';

const meta = {
  title: 'Pages/DashboardPage',
  component: DashboardPage,
  args: {
    eyebrow: 'Platform administration',
    title: 'Dashboard',
    pods: [
      {
        description: 'Manage organisations and their lifecycle.',
        href: '/admin/organisations',
        label: 'Organisations',
        value: 12,
      },
      {
        description: 'Manage every Hektor account.',
        href: '/admin/users',
        label: 'Users',
        value: 53,
      },
    ],
  },
} satisfies Meta<typeof DashboardPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Platform: Story = {};

export const Loading: Story = { args: { loading: true } };

export const Error: Story = {
  args: { error: 'We could not load dashboard statistics.' },
};
