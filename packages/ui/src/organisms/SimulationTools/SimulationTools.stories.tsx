import type { Meta, StoryObj } from '@storybook/react-vite';

import { SimulationTools } from './SimulationTools.component';

const meta = {
  title: 'Organisms/SimulationTools',
  component: SimulationTools,
  parameters: { layout: 'padded' },
  args: {
    exitHref: '#patient-profile',
  },
} satisfies Meta<typeof SimulationTools>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
