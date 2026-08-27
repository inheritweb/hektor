import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrganisationRole, ProvisioningMethod } from '@hektor/types';

import { OrganisationInvitationManagerSheet } from './OrganisationInvitationManagerSheet.component';

const meta = {
  title: 'Organisms/OrganisationInvitationManagerSheet',
  component: OrganisationInvitationManagerSheet,
  args: {
    candidates: [
      {
        email: 'ada@example.com',
        id: 'c65a9c98-edeb-483f-9356-aec3806623d1',
        name: 'Ada Lovelace',
        provisioningMethod: ProvisioningMethod.Csv,
        role: OrganisationRole.Learner,
      },
      {
        email: 'grace@example.com',
        id: '1f4ac63a-8aae-418d-8378-a74151c1877e',
        invitationExpiresAt: '2027-01-02T12:00:00.000Z',
        invitationSentAt: '2027-01-01T12:00:00.000Z',
        name: 'Grace Hopper',
        provisioningMethod: ProvisioningMethod.Manual,
        role: OrganisationRole.Tutor,
      },
    ],
    onFilterChange: () => undefined,
    onOpenChange: () => undefined,
    onPageChange: () => undefined,
    onSend: () => undefined,
    open: true,
    page: 1,
    pageSize: 20,
    query: '',
    totalRecords: 2,
  },
} satisfies Meta<typeof OrganisationInvitationManagerSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
