import type { Meta, StoryObj } from '@storybook/react-vite';

import { InstitutionalAccessUnavailablePage } from './InstitutionalAccessUnavailablePage.component';

const meta = {
  title: 'Pages/InstitutionalAccessUnavailablePage',
  component: InstitutionalAccessUnavailablePage,
  args: { institutionName: 'Northbridge University' },
} satisfies Meta<typeof InstitutionalAccessUnavailablePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
