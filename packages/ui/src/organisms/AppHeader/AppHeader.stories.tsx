import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppHeader } from './AppHeader.component';

const meta = {
  title: 'Organisms/AppHeader',
  component: AppHeader,
  args: { title: 'Hektor' },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="bg-page px-6 py-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
