import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminUserFormPage } from './AdminUserFormPage.component';

const meta = {
  title: 'Pages/AdminUserFormPage',
  component: AdminUserFormPage,
  args: { cancelHref: '#', onSubmit: () => undefined },
} satisfies Meta<typeof AdminUserFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
