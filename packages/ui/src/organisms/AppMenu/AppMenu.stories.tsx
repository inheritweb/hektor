import type { Meta, StoryObj } from '@storybook/react-vite';
import { LuFileText, LuHouse, LuSettings } from 'react-icons/lu';

import { Logo, ThemeSwitcher } from '../../molecules';

import { AppMenu } from './AppMenu.component';

const items = [
  { label: 'Home', icon: LuHouse, href: '#home', active: true },
  { label: 'Documents', icon: LuFileText, href: '#documents' },
  { label: 'Settings', icon: LuSettings, href: '#settings' },
];

const meta = {
  title: 'Organisms/AppMenu',
  component: AppMenu,
  args: {
    compactHeader: <Logo size="md" variant="mark" />,
    header: <Logo size="md" />,
    items,
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
