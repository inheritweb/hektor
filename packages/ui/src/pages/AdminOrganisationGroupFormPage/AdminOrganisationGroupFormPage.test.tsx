import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AdminOrganisationGroupFormPage } from './AdminOrganisationGroupFormPage.component';

describe('AdminOrganisationGroupFormPage', () => {
  it('trims and submits a locally managed group', () => {
    const onSubmit = vi.fn();
    render(
      <AdminOrganisationGroupFormPage
        cancelHref="#"
        cohorts={[]}
        mode="create"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '  Biology tutors  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create group' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Biology tutors' }),
    );
  });
});
