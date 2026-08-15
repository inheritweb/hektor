import type { Meta, StoryObj } from '@storybook/react-vite';
import { LuBuilding2, LuHouse, LuUsers } from 'react-icons/lu';

import { Logo, ThemeSwitcher } from '../../molecules';

import { AppMenu } from './AppMenu.component';

const sections = [
  {
    items: [{ label: 'Home', icon: LuHouse, href: '#home', active: true }],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Users', icon: LuUsers, href: '#users' },
      { label: 'Organisations', icon: LuBuilding2, href: '#organisations' },
    ],
  },
];

const meta = {
  title: 'Organisms/AppMenu',
  component: AppMenu,
  args: {
    compactHeader: <Logo size="md" variant="mark" />,
    header: <Logo size="md" />,
    sections,
    footer: <ThemeSwitcher />,
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};

export const Hidden: Story = { args: { state: 'hidden' } };

export const Icons: Story = { args: { state: 'icons' } };

export const Expanded: Story = { args: { state: 'expanded' } };

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
