import type { Meta, StoryObj } from '@storybook/react-vite';

import { InvitationUnavailablePage } from './InvitationUnavailablePage.component';

const meta = {
  title: 'Pages/InvitationUnavailablePage',
  component: InvitationUnavailablePage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof InvitationUnavailablePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
