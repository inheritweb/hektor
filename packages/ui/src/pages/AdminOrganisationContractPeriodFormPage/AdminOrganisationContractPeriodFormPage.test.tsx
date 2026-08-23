import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AdminOrganisationContractPeriodFormPage } from './AdminOrganisationContractPeriodFormPage.component';

describe('AdminOrganisationContractPeriodFormPage', () => {
  it('submits dates and learner seat allowance', () => {
    const onSubmit = vi.fn();
    render(
      <AdminOrganisationContractPeriodFormPage
        cancelHref="#"
        mode="create"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Starts on'), {
      target: { value: '2027-09-01' },
    });
    fireEvent.change(screen.getByLabelText(/Ends on/), {
      target: { value: '2028-09-01' },
    });
    fireEvent.change(screen.getByLabelText('Learner seat allowance'), {
      target: { value: '300' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Create contract period' }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      endsOn: '2028-09-01',
      learnerSeatAllowance: 300,
      startsOn: '2027-09-01',
    });
  });
});
