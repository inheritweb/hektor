import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from './Sheet.component';

const meta = {
  title: 'Atoms/Sheet',
  component: Sheet,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        Open sheet
      </SheetTrigger>
      <SheetContent className="gap-2 p-6" side="left">
        <SheetTitle>Navigation</SheetTitle>
        <SheetDescription>An accessible overlay surface.</SheetDescription>
      </SheetContent>
    </Sheet>
  ),
};
