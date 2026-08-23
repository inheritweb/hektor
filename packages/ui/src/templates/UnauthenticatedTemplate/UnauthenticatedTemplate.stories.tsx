import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button, Input } from '../../atoms';

import { UnauthenticatedTemplate } from './UnauthenticatedTemplate.component';

const meta = {
  title: 'Templates/UnauthenticatedTemplate',
  component: UnauthenticatedTemplate,
  args: {
    children: (
      <>
        <h1 className="text-4xl font-bold tracking-tight">Welcome back.</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Sign in to continue to Hektor.
        </p>
        <div className="mt-8 space-y-4">
          <Input aria-label="Email address" placeholder="you@example.com" />
          <Button className="h-11 w-full">Continue with email</Button>
        </div>
      </>
    ),
  },
} satisfies Meta<typeof UnauthenticatedTemplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Wide: Story = { args: { width: 'lg' } };
