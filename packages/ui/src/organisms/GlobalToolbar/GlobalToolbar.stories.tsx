import type { Meta, StoryObj } from '@storybook/react-vite';
import { LuEllipsis } from 'react-icons/lu';

import { Button } from '../../atoms/Button';

import { GlobalToolbar } from './GlobalToolbar.component';

const meta = {
  title: 'Organisms/GlobalToolbar',
  component: GlobalToolbar,
  args: {
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Admin', href: '/admin' },
      { label: 'Users' },
    ],
  },
} satisfies Meta<typeof GlobalToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Breadcrumbs: Story = {};

export const WithTools: Story = {
  args: {
    tools: (
      <Button aria-label="Page tools" size="icon-sm" variant="ghost">
        <LuEllipsis aria-hidden="true" />
      </Button>
    ),
  },
};
