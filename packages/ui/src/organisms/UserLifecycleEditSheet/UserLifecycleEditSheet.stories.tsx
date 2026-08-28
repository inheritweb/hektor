import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlatformRole, UserStatus } from '@hektor/types';

import { UserLifecycleEditSheet } from './UserLifecycleEditSheet.component';

const meta = {
  title: 'Organisms/UserLifecycleEditSheet',
  component: UserLifecycleEditSheet,
  args: {
    initialValues: {
      firstName: 'Alex',
      lastName: 'Morgan',
      platformRole: PlatformRole.Admin,
      status: UserStatus.Active,
    },
    onOpenChange: () => undefined,
    onSave: () => undefined,
    open: true,
  },
} satisfies Meta<typeof UserLifecycleEditSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Suspended: Story = {
  args: {
    initialValues: {
      firstName: 'Alex',
      lastName: 'Morgan',
      status: UserStatus.Suspended,
    },
  },
};
