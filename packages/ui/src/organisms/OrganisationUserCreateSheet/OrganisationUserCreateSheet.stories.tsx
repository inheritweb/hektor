import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrganisationUserCreateSheet } from './OrganisationUserCreateSheet.component';

const meta = {
  title: 'Organisms/OrganisationUserCreateSheet',
  component: OrganisationUserCreateSheet,
  args: {
    cohorts: [{ id: '1', name: 'Autumn 2026' }],
    onOpenChange: () => undefined,
    onSave: () => undefined,
    open: true,
  },
} satisfies Meta<typeof OrganisationUserCreateSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
