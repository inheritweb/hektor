import type { Meta, StoryObj } from '@storybook/react-vite';

import { SimulationTemplate } from './SimulationTemplate.component';

const meta = {
  title: 'Templates/SimulationTemplate',
  component: SimulationTemplate,
  parameters: { layout: 'fullscreen' },
  args: {
    header: <div className="p-5 font-semibold">Simulation header</div>,
    children: <div className="p-8">Simulation workspace</div>,
    tools: <div className="pr-8">Simulation tools and activities</div>,
  },
} satisfies Meta<typeof SimulationTemplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
