import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OrganisationRole } from '@hektor/types';

import { OrganisationUserProvisionFormPage } from './OrganisationUserProvisionFormPage.component';

describe('OrganisationUserProvisionFormPage', () => {
  it('submits a provision rather than creating a canonical account', async () => {
    const onSubmit = vi.fn();
    render(
      <OrganisationUserProvisionFormPage
        cancelHref="/users/provisions"
        onSubmit={onSubmit}
      />,
    );

    await userEvent.type(screen.getByLabelText('First name'), '  Isla');
    await userEvent.type(screen.getByLabelText('Last name'), 'Phillips  ');
    await userEvent.type(
      screen.getByLabelText('Email address'),
      'isla@example.com',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Invite user' }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'isla@example.com',
      firstName: 'Isla',
      lastName: 'Phillips',
      role: OrganisationRole.Learner,
      sendInvitation: true,
    });
  });
});
