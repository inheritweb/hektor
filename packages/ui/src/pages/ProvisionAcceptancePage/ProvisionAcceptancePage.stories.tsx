import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProvisionAcceptancePage } from './ProvisionAcceptancePage.component';

const meta = {
  title: 'Pages/ProvisionAcceptancePage',
  component: ProvisionAcceptancePage,
  args: {
    onAccept: () => undefined,
    onDecline: () => undefined,
    organisationName: 'Northbridge University',
    provisionedDisplayName: 'Maya Patel',
    provisionedRole: 'learner',
    provisionedUserName: 'maya@northbridge.example',
  },
} satisfies Meta<typeof ProvisionAcceptancePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Accepting: Story = { args: { isAccepting: true } };
