import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminUsersPage } from './AdminUsersPage.component';

const meta = {
  title: 'Pages/AdminUsersPage',
  component: AdminUsersPage,
  args: {
    onPageChange: () => undefined,
    page: 1,
    pageSize: 20,
    totalRecords: 2,
    users: [
      {
        id: '1',
        displayName: 'Alex Morgan',
        email: 'alex@example.com',
        platformRole: 'admin',
        createdAt: '2026-08-01T10:00:00.000Z',
        lastSignInAt: '2026-08-15T10:00:00.000Z',
        identityProviders: ['email', 'google'],
        membershipCount: 2,
      },
      {
        id: '2',
        displayName: 'Sam Rivera',
        email: 'sam@example.com',
        createdAt: '2026-08-10T10:00:00.000Z',
        identityProviders: ['email'],
        membershipCount: 0,
      },
    ],
  },
} satisfies Meta<typeof AdminUsersPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { args: { loading: true, users: [] } };

export const Empty: Story = { args: { totalRecords: 0, users: [] } };

export const Error: Story = {
  args: { error: 'Users could not be loaded.', users: [] },
};
