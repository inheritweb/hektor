import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input.component';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  args: {
    'aria-label': 'Email address',
    placeholder: 'you@example.com',
    type: 'email',
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };
