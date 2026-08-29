import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrganisationUserProvisionFormPage } from './OrganisationUserProvisionFormPage.component';

const meta = {
  title: 'Pages/OrganisationUserProvisionFormPage',
  component: OrganisationUserProvisionFormPage,
  args: { cancelHref: '#', onSubmit: () => undefined },
} satisfies Meta<typeof OrganisationUserProvisionFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = {
  args: { error: 'This person already has an active provision.' },
};
