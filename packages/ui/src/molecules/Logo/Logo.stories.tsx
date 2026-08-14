import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logo } from './Logo.component';

const meta = {
  title: 'Molecules/Logo',
  component: Logo,
  args: { label: 'Hektor', size: 'md', variant: 'lockup' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['mark', 'lockup'] },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lockup: Story = {};
export const Mark: Story = { args: { variant: 'mark' } };
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <Logo size="sm" />
      <Logo size="md" />
      <Logo size="lg" />
      <Logo size="xl" />
    </div>
  ),
};
