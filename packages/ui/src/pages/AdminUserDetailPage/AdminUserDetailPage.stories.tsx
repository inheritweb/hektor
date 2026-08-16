import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminUserDetailPage } from './AdminUserDetailPage.component';

const meta = {
  title: 'Pages/AdminUserDetailPage',
  component: AdminUserDetailPage,
  args: {
    backHref: '#users',
    user: {
      id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      displayName: 'Alex Morgan',
      email: 'alex@example.com',
      platformRole: 'admin',
      createdAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-15T10:00:00.000Z',
      identities: [
        {
          id: 'email-identity',
          provider: 'email',
          email: 'alex@example.com',
          lastSignInAt: '2026-08-15T10:00:00.000Z',
        },
        {
          id: 'google-identity',
          provider: 'google',
          email: 'alex@example.com',
          lastSignInAt: '2026-08-14T10:00:00.000Z',
        },
      ],
      memberships: [
        {
          id: 'membership-1',
          organisation: {
            id: 'organisation-1',
            name: 'Northbridge College',
            status: 'active',
          },
          role: 'organisation_admin',
          status: 'active',
        },
      ],
    },
  },
} satisfies Meta<typeof AdminUserDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PersonalOnly: Story = {
  args: {
    user: {
      ...meta.args.user,
      platformRole: undefined,
      memberships: [],
    },
  },
};
