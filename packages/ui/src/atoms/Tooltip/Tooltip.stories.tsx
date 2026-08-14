import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip.component';

const meta = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>
        Hover me
      </TooltipTrigger>
      <TooltipContent>Helpful context</TooltipContent>
    </Tooltip>
  ),
};
