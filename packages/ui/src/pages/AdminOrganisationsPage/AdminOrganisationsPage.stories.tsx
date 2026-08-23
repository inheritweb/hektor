import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminOrganisationsPage } from './AdminOrganisationsPage.component';

const meta = {
  title: 'Pages/AdminOrganisationsPage',
  component: AdminOrganisationsPage,
  args: {
    archived: false,
    onArchivedChange: () => undefined,
    onPageChange: () => undefined,
    organisations: [
      {
        id: '1',
        name: 'Northbridge University',
        slug: 'northbridge-university',
        status: 'active',
      },
      {
        id: '2',
        name: 'Westmere College',
        slug: 'westmere-college',
        status: 'suspended',
      },
    ],
    page: 1,
    pageSize: 20,
    totalRecords: 2,
  },
} satisfies Meta<typeof AdminOrganisationsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true, organisations: [] },
};

export const Empty: Story = {
  args: { organisations: [], totalRecords: 0 },
};

export const Error: Story = {
  args: {
    error: 'Organisations could not be loaded.',
    organisations: [],
  },
};
