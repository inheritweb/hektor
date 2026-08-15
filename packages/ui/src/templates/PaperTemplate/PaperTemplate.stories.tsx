import type { Meta, StoryObj } from '@storybook/react-vite';
import { LuFileText, LuHouse, LuSettings } from 'react-icons/lu';

import { Logo, ThemeSwitcher } from '../../molecules';
import { AppHeader } from '../../organisms';

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
    menuCompactHeader: <Logo size="md" variant="mark" />,
    menuHeader: <Logo size="md" />,
    menuItems,
    menuFooter: <ThemeSwitcher />,
    header: <AppHeader title="Hektor" />,
    children: (
      <div>
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

export const LongContent: Story = {
  args: {
    children: (
      <div className="space-y-12">
        {Array.from({ length: 10 }, (_, index) => (
          <section className="max-w-3xl space-y-4" key={index}>
            <h2 className="text-2xl font-semibold">Section {index + 1}</h2>
            <p className="leading-7 text-muted-foreground">
              This representative content makes the paper taller than the
              available viewport. The application shell and navigation remain
              fixed while the paper becomes the focused scrolling region.
            </p>
            <p className="leading-7 text-muted-foreground">
              Generous spacing keeps longer pages calm and readable without
              making individual elements feel crowded or visually demanding.
            </p>
          </section>
        ))}
      </div>
    ),
  },
};
