import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrganisationRole } from '@hektor/types';
import { OrganisationMembershipCreateSheet } from './OrganisationMembershipCreateSheet.component';

const meta = {
  title: 'Organisms/OrganisationMembershipCreateSheet',
  component: OrganisationMembershipCreateSheet,
  args: {
    candidates: [
      { id: '1', title: 'Priya Shah', email: 'priya@example.test' },
      {
        id: '2',
        title: 'Isla Phillips',
        email: 'isla@example.test',
        pendingProvisionRole: OrganisationRole.Learner,
      },
    ],
    cohorts: [{ id: '1', name: 'Autumn 2026' }],
    onOpenChange: () => undefined,
    onPageChange: () => undefined,
    onSave: () => undefined,
    onSearchChange: () => undefined,
    open: true,
    page: 1,
    pageSize: 20,
    search: '',
    totalRecords: 2,
  },
} satisfies Meta<typeof OrganisationMembershipCreateSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
