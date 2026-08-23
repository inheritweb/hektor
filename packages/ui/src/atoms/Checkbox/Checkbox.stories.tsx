import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from './Checkbox.component';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Example selection' },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = { args: { indeterminate: true } };
