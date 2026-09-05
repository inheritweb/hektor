import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  PatientCareSetting,
  PatientScenarioClinicalAudience,
} from '@hektor/types';

import { AdminPatientScenarioFormPage } from './AdminPatientScenarioFormPage.component';

afterEach(cleanup);

describe('AdminPatientScenarioFormPage', () => {
  it('derives an editable slug and submits bounded scenario values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <AdminPatientScenarioFormPage
        cancelHref="/admin/patient-profiles/profile/version/version"
        mode="create"
        onSubmit={onSubmit}
        patientName="Esther Jenkins"
        versionNumber={1}
      />,
    );

    await user.type(screen.getByLabelText('Title'), 'A Simple Scenario');
    const slug = screen.getByRole('textbox', { name: /^Slug/u });
    expect((slug as HTMLInputElement).value).toBe('a-simple-scenario');
    await user.clear(slug);
    await user.type(slug, 'esther-review');
    await user.type(screen.getByLabelText('Description'), 'A draft scenario.');
    await user.click(screen.getByLabelText('Nursing'));
    await user.type(
      screen.getByLabelText('Beginning-step title'),
      'Initial presentation',
    );
    await user.type(
      screen.getByLabelText('Beginning-step description'),
      'The first moment.',
    );
    await user.click(screen.getByRole('button', { name: 'Create scenario' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'A Simple Scenario',
      slug: 'esther-review',
      description: 'A draft scenario.',
      careSetting: PatientCareSetting.AcuteInpatient,
      intendedClinicalAudiences: [PatientScenarioClinicalAudience.Nursing],
      beginningStepTitle: 'Initial presentation',
      beginningStepDescription: 'The first moment.',
    });
  });

  it('shows submission and server failure states', () => {
    render(
      <AdminPatientScenarioFormPage
        cancelHref="#cancel"
        error="A system scenario already uses this slug"
        mode="create"
        onSubmit={() => undefined}
        patientName="Esther Jenkins"
        pending
        versionNumber={1}
      />,
    );

    expect(screen.getByRole('alert').textContent).toContain(
      'A system scenario already uses this slug',
    );
    expect(
      (screen.getByRole('button', { name: 'Creating…' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('edits populated values while keeping patient context read only', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <AdminPatientScenarioFormPage
        cancelHref="#patient"
        initialValues={{
          title: 'Original scenario',
          slug: 'original-scenario',
          description: 'Original description.',
          careSetting: PatientCareSetting.Community,
          intendedClinicalAudiences: [PatientScenarioClinicalAudience.Nursing],
          beginningStepTitle: 'Original beginning',
          beginningStepDescription: 'Original beginning description.',
        }}
        mode="edit"
        onSubmit={onSubmit}
        patientName="Esther Jenkins"
        previewHref="#preview"
        success="Scenario saved"
        versionNumber={3}
      />,
    );

    expect(
      screen.getByText(/Esther Jenkins, pinned to profile version 3/u),
    ).toBeDefined();
    expect(screen.queryByRole('textbox', { name: /patient/iu })).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('Scenario saved');
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated scenario');
    expect(
      (screen.getByRole('textbox', { name: /^Slug/u }) as HTMLInputElement)
        .value,
    ).toBe('original-scenario');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated scenario',
        slug: 'original-scenario',
        beginningStepTitle: 'Original beginning',
      }),
    );
  });
});
