import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrganisationRole, OrganisationUserStatus } from '@hektor/types';
import { AdminOrganisationMembershipFormPage } from './AdminOrganisationMembershipFormPage.component';

const meta = {
  title: 'Pages/AdminOrganisationMembershipFormPage',
  component: AdminOrganisationMembershipFormPage,
  args: {
    cancelHref: '#',
    cohorts: [{ id: '1', name: 'Autumn 2026' }],
    initialValues: {
      cohortId: '1',
      role: OrganisationRole.Learner,
      status: OrganisationUserStatus.Active,
    },
    onSubmit: () => undefined,
    userName: 'Isla Phillips',
  },
} satisfies Meta<typeof AdminOrganisationMembershipFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Manual: Story = {};

export const ProvisionControlled: Story = {
  args: { provisionControlled: true },
};
