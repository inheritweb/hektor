import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { GroupStatus } from '@hektor/types';

import { AdminOrganisationGroupFormPage } from './AdminOrganisationGroupFormPage.component';

const meta = {
  title: 'Pages/AdminOrganisationGroupFormPage',
  component: AdminOrganisationGroupFormPage,
  args: {
    cancelHref: '#',
    cohorts: [{ id: 'cohort-1', name: 'September 2026' }],
    mode: 'create',
    onSubmit: fn(),
  },
} satisfies Meta<typeof AdminOrganisationGroupFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const EditExternal: Story = {
  args: {
    initialValues: {
      cohortId: 'cohort-1',
      name: 'Biology tutors',
      status: GroupStatus.Active,
    },
    mode: 'edit',
    source: { externalId: 'group-42', method: 'scim' },
  },
};
