import type { Meta, StoryObj } from '@storybook/react-vite';
import { LuHouse } from 'react-icons/lu';

import { AppMenuItem } from './AppMenuItem.component';

const meta = {
  title: 'Molecules/AppMenuItem',
  component: AppMenuItem,
  args: { icon: LuHouse, label: 'Home' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AppMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};
export const Collapsed: Story = { args: { collapsed: true } };
export const Active: Story = { args: { active: true } };
