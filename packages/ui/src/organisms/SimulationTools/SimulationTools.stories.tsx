import type { Meta, StoryObj } from '@storybook/react-vite';

import { SimulationTools } from './SimulationTools.component';

const meta = {
  title: 'Organisms/SimulationTools',
  component: SimulationTools,
  parameters: { layout: 'padded' },
  args: {
    exitHref: '#patient-profile',
    nextPreview: { href: '#next', label: 'Esther Jenkins' },
    previousPreview: { href: '#previous', label: 'Emma Barlow' },
  },
} satisfies Meta<typeof SimulationTools>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FirstPatient: Story = {
  args: { previousPreview: undefined },
};

export const LastPatient: Story = {
  args: { nextPreview: undefined },
};

export const ScenarioPreview: Story = {
  args: {
    nextPreview: undefined,
    previousPreview: undefined,
    previewLabel: 'Platform-admin scenario preview',
    scenario: {
      currentStepId: '563b99e4-6af4-49e4-90b8-e16eb676d27e',
      currentStepTitle: 'Admission to the stroke unit',
      status: 'draft',
      steps: [
        {
          id: '563b99e4-6af4-49e4-90b8-e16eb676d27e',
          kind: 'beginning',
          title: 'Admission to the stroke unit',
        },
        {
          id: 'fc7c473b-78cb-4b38-9e5d-06a9e17437e1',
          kind: 'progression',
          title: 'Swallowing and communication review',
        },
        {
          id: 'ad82b43b-9649-4884-a865-4d80ccc18dc8',
          kind: 'progression',
          title: 'Functional and psychological review',
        },
      ],
      title: 'Acute ischaemic stroke admission',
    },
  },
};
