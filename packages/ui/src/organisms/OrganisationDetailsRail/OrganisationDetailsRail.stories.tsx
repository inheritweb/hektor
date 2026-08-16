import type { Meta, StoryObj } from '@storybook/react-vite';

import { OrganisationDetailsRail } from './OrganisationDetailsRail.component';

const meta = {
  title: 'Organisms/OrganisationDetailsRail',
  component: OrganisationDetailsRail,
  args: {
    organisation: {
      name: 'Northbridge University',
      slug: 'northbridge-university',
      status: 'active',
      createdAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-15T11:00:00.000Z',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OrganisationDetailsRail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
