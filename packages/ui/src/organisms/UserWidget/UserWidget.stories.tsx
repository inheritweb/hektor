import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { UserWidget } from './UserWidget.component';

const contexts = [
  { id: 'personal', label: 'Personal account' },
  { id: 'northshire', label: 'Northshire University' },
  { id: 'westborough', label: 'Westborough University' },
];

const meta = {
  title: 'Organisms/UserWidget',
  component: UserWidget,
  args: {
    contexts,
    currentContextId: 'personal',
    displayName: 'Alex Morgan',
    email: 'alex@example.com',
    onContextChange: () => undefined,
    onSignOut: () => undefined,
    profileHref: '#profile',
  },
  decorators: [
    (Story) => (
      <div className="w-72 bg-menu p-4 text-menu-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args) => {
    const [currentContextId, setCurrentContextId] = useState('personal');

    return (
      <UserWidget
        {...args}
        currentContextId={currentContextId}
        onContextChange={setCurrentContextId}
      />
    );
  },
};

export const Compact: Story = { args: { compact: true } };
