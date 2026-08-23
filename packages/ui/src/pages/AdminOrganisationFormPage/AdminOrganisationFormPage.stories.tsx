import type { Meta, StoryObj } from '@storybook/react-vite';

import { OrganisationStatus } from '@hektor/types';

import { AdminOrganisationFormPage } from './AdminOrganisationFormPage.component';

const meta = {
  title: 'Pages/AdminOrganisationFormPage',
  component: AdminOrganisationFormPage,
  args: {
    cancelHref: '/admin/organisations',
    mode: 'create',
    onSubmit: () => undefined,
  },
} satisfies Meta<typeof AdminOrganisationFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = {
  args: {
    initialValues: {
      name: 'Northbridge University',
      slug: 'northbridge-university',
      status: OrganisationStatus.Active,
    },
    mode: 'edit',
  },
};
