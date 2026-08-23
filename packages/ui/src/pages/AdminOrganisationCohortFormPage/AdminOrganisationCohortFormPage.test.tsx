import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GroupStatus } from '@hektor/types';

import { AdminOrganisationCohortFormPage } from './AdminOrganisationCohortFormPage.component';

describe('AdminOrganisationCohortFormPage', () => {
  it('submits the cohort identity and dates', () => {
    const onSubmit = vi.fn();
    render(
      <AdminOrganisationCohortFormPage
        cancelHref="#"
        mode="create"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: ' September 2027 ' },
    });
    fireEvent.change(screen.getByLabelText('Starts on'), {
      target: { value: '2027-09-01' },
    });
    fireEvent.change(screen.getByLabelText('Ends on'), {
      target: { value: '2028-08-31' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create cohort' }));

    expect(onSubmit).toHaveBeenCalledWith({
      endsOn: '2028-08-31',
      name: 'September 2027',
      startsOn: '2027-09-01',
      status: GroupStatus.Active,
    });
  });
});
