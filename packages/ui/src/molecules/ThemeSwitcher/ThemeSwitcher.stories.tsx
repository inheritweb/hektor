import type { Meta, StoryObj } from '@storybook/react-vite';

import { ThemeSwitcher } from './ThemeSwitcher.component';

const meta = {
  title: 'Molecules/ThemeSwitcher',
  component: ThemeSwitcher,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
