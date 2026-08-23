import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminOrganisationContractPeriodFormPage } from './AdminOrganisationContractPeriodFormPage.component';

const meta = {
  title: 'Pages/AdminOrganisationContractPeriodFormPage',
  component: AdminOrganisationContractPeriodFormPage,
  args: {
    cancelHref: '#',
    mode: 'create',
    onSubmit: () => undefined,
  },
} satisfies Meta<typeof AdminOrganisationContractPeriodFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = {
  args: {
    activatedSeats: 34,
    initialValues: {
      endsOn: '2027-09-01',
      learnerSeatAllowance: 250,
      startsOn: '2026-09-01',
    },
    mode: 'edit',
  },
};

export const Error: Story = {
  args: { error: 'Contract periods cannot overlap.' },
};
