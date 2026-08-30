import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrganisationRole } from '@hektor/types';

import { OrganisationScimConfigurationPage } from './OrganisationScimConfigurationPage.component';

const meta = {
  component: OrganisationScimConfigurationPage,
  title: 'Pages/OrganisationScimConfigurationPage',
  args: {
    configuration: {
      defaultRole: OrganisationRole.Learner,
      enabled: true,
      endpointPath: '/api/scim/v2',
      tokenSuffix: 'r7K2',
    },
    defaultRole: OrganisationRole.Learner,
    endpoint: 'https://app.hektor.example/api/scim/v2',
    onDefaultRoleChange: () => undefined,
    onIssueToken: () => undefined,
    onRevokeToken: () => undefined,
    onSave: () => undefined,
  },
} satisfies Meta<typeof OrganisationScimConfigurationPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Configured: Story = {};

export const TokenJustIssued: Story = {
  args: { issuedToken: 'hektor_scim_example-token-shown-once' },
};
