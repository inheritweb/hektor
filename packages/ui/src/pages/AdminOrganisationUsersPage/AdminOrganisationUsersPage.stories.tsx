import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminOrganisationUsersPage } from './AdminOrganisationUsersPage.component';

const meta = {
  title: 'Pages/AdminOrganisationUsersPage',
  component: AdminOrganisationUsersPage,
  args: {
    onPageChange: () => undefined,
    organisation: {
      name: 'Northbridge University',
      slug: 'northbridge-university',
      status: 'active',
      createdAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-15T11:00:00.000Z',
    },
    page: 1,
    pageSize: 20,
    totalRecords: 2,
    users: [
      {
        id: '1',
        displayName: 'Maya Patel',
        userName: 'maya.patel@northbridge.example',
        role: 'org_admin',
        status: 'active',
        scimStatus: 'active',
        linked: true,
      },
      {
        id: '2',
        displayName: 'Sam Rivera',
        userName: 'sam.rivera@northbridge.example',
        role: 'learner',
        status: 'active',
        scimStatus: 'active',
        linked: false,
      },
    ],
  },
} satisfies Meta<typeof AdminOrganisationUsersPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { args: { loading: true, users: [] } };

export const Empty: Story = { args: { totalRecords: 0, users: [] } };
