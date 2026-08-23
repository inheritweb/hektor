import type { Meta, StoryObj } from '@storybook/react-vite';

import { GroupStatus } from '@hektor/types';

import { AdminOrganisationCohortFormPage } from './AdminOrganisationCohortFormPage.component';

const meta = {
  title: 'Pages/AdminOrganisationCohortFormPage',
  component: AdminOrganisationCohortFormPage,
  args: { cancelHref: '#', mode: 'create', onSubmit: () => undefined },
} satisfies Meta<typeof AdminOrganisationCohortFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = {
  args: {
    initialValues: {
      endsOn: '2028-08-31',
      name: 'September 2027',
      startsOn: '2027-09-01',
      status: GroupStatus.Active,
    },
    mode: 'edit',
  },
};

export const Error: Story = {
  args: { error: 'The cohort changed while you were editing it.' },
};
