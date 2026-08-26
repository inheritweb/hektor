import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AdminUserFormPage } from './AdminUserFormPage.component';

describe('AdminUserFormPage', () => {
  it('creates a canonical user without an organisation connection', () => {
    const onSubmit = vi.fn();
    render(<AdminUserFormPage cancelHref="/admin/users" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('First name'), {
      target: { value: 'Nina' },
    });
    fireEvent.change(screen.getByLabelText('Last name'), {
      target: { value: 'Foster' },
    });
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'nina@example.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add user' }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'nina@example.test',
      firstName: 'Nina',
      lastName: 'Foster',
      platformRole: undefined,
    });
  });
});
