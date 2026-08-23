import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { MembershipManagerSheet } from './MembershipManagerSheet.component';

const meta = {
  title: 'Organisms/MembershipManagerSheet',
  component: MembershipManagerSheet,
  args: {
    currentMemberIds: ['1'],
    description: 'Choose the organisation users who belong to this group.',
    emptyMessage: 'No users match this search.',
    items: [
      {
        id: '1',
        title: 'Maya Patel',
        subtitle: 'maya@example.com',
        detail: 'Learner',
      },
      {
        id: '2',
        title: 'Sam Rivera',
        subtitle: 'sam@example.com',
        detail: 'Tutor',
      },
    ],
    onOpenChange: fn(),
    onPageChange: fn(),
    onSave: fn(),
    onSearchChange: fn(),
    open: true,
    page: 1,
    pageSize: 20,
    search: '',
    title: 'Manage users',
    totalRecords: 2,
  },
} satisfies Meta<typeof MembershipManagerSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
