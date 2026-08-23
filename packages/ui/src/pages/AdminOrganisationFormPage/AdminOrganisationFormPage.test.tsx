import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AdminOrganisationFormPage } from './AdminOrganisationFormPage.component';

describe('AdminOrganisationFormPage', () => {
  it('derives a valid slug and submits the organisation', async () => {
    const onSubmit = vi.fn();
    render(
      <AdminOrganisationFormPage
        cancelHref="/admin/organisations"
        mode="create"
        onSubmit={onSubmit}
      />,
    );

    await userEvent.type(
      screen.getByLabelText('Name'),
      'Northbridge University',
    );
    expect(
      (screen.getByRole('textbox', { name: /^Slug/ }) as HTMLInputElement)
        .value,
    ).toBe('northbridge-university');
    await userEvent.click(
      screen.getByRole('button', { name: 'Create organisation' }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Northbridge University',
      slug: 'northbridge-university',
      status: 'active',
    });
  });
});
