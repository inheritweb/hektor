import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  OrganisationProvisionImportAction,
  OrganisationRole,
} from '@hektor/types';

import { OrganisationProvisionImportSheet } from './OrganisationProvisionImportSheet.component';

const meta = {
  title: 'Organisms/OrganisationProvisionImportSheet',
  component: OrganisationProvisionImportSheet,
  args: {
    open: true,
    onOpenChange: () => undefined,
    onPreview: () => undefined,
    onCommit: () => undefined,
    preview: {
      rows: [
        {
          action: OrganisationProvisionImportAction.CreateProvision,
          email: 'ada@example.com',
          firstName: 'Ada',
          lastName: 'Lovelace',
          message: 'Will create a pending provision',
          role: OrganisationRole.Learner,
          rowNumber: 2,
        },
      ],
      summary: { errors: 0, ready: 1, unchanged: 0 },
    },
  },
} satisfies Meta<typeof OrganisationProvisionImportSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {};
