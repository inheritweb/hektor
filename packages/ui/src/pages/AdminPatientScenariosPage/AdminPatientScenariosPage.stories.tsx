import type { Meta, StoryObj } from '@storybook/react-vite';

import { AdminPatientScenariosPage } from './AdminPatientScenariosPage.component';

const meta = {
  title: 'Pages/AdminPatientScenariosPage',
  component: AdminPatientScenariosPage,
  args: { scenarios: [] },
} satisfies Meta<typeof AdminPatientScenariosPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Loading: Story = { args: { loading: true } };

export const Error: Story = { args: { error: 'Unable to load scenarios.' } };

export const Populated: Story = {
  args: {
    scenarios: [
      {
        id: '6f262163-c139-4da2-b491-0644df7164e3',
        title: 'Acute ischaemic stroke',
        patientName: 'Esther Jenkins',
        description: 'Esther is admitted following an acute ischaemic stroke.',
        careSetting: 'acute_inpatient',
        status: 'draft',
        versionNumber: 1,
      },
    ],
  },
};
