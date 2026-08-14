import type { Meta, StoryObj } from '@storybook/react-vite';
import { LuFileText, LuHouse, LuSettings } from 'react-icons/lu';

import { ThemeSwitcher } from '../../molecules';

import { PaperTemplate } from './PaperTemplate.component';

const menuItems = [
  { label: 'Home', icon: LuHouse, href: '#home', active: true },
  { label: 'Documents', icon: LuFileText, href: '#documents' },
  { label: 'Settings', icon: LuSettings, href: '#settings' },
];

const meta = {
  title: 'Templates/PaperTemplate',
  component: PaperTemplate,
  args: {
    menuHeader: <strong className="block truncate">Hektor</strong>,
    menuItems,
    menuFooter: <ThemeSwitcher />,
    children: (
      <div className="mx-auto min-h-96 max-w-4xl rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="mt-6 h-3 w-full rounded bg-muted" />
        <div className="mt-3 h-3 w-3/4 rounded bg-muted" />
      </div>
    ),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PaperTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
