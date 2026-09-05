import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PatientCareSetting,
  PatientScenarioClinicalAudience,
} from '@hektor/types';

import { AdminPatientScenarioFormPage } from './AdminPatientScenarioFormPage.component';

const meta = {
  title: 'Pages/AdminPatientScenarioFormPage',
  component: AdminPatientScenarioFormPage,
  args: {
    cancelHref: '#patient-profile',
    mode: 'create',
    onSubmit: () => undefined,
    patientName: 'Esther Jenkins',
    versionNumber: 1,
  },
} satisfies Meta<typeof AdminPatientScenarioFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Submitting: Story = { args: { pending: true } };

export const Edit: Story = {
  args: {
    initialValues: {
      title: 'Acute ischaemic stroke admission',
      slug: 'esther-acute-ischaemic-stroke',
      description: 'Esther is admitted following a FAST-positive event.',
      careSetting: PatientCareSetting.AcuteInpatient,
      intendedClinicalAudiences: [
        PatientScenarioClinicalAudience.Nursing,
        PatientScenarioClinicalAudience.Medicine,
      ],
      beginningStepTitle: 'Admission to the stroke unit',
      beginningStepDescription: 'The beginning state of the scenario.',
    },
    mode: 'edit',
    previewHref: '#preview',
    success: 'Scenario saved',
  },
};

export const ServerFailure: Story = {
  args: {
    error: 'A system scenario already uses this slug',
    slugError: 'Choose a different slug',
  },
};
