import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserWidget } from './UserWidget.component';

const contexts = [
  { id: 'personal', label: 'Personal account' },
  { id: 'university', label: 'Northshire University' },
];

afterEach(cleanup);

describe('UserWidget', () => {
  it('selects an organisation context', async () => {
    const onContextChange = vi.fn();

    render(
      <UserWidget
        contexts={contexts}
        currentContextId="personal"
        displayName="Alex Morgan"
        email="alex@example.com"
        onContextChange={onContextChange}
        onSignOut={() => undefined}
        profileHref="#profile"
      />,
    );

    await userEvent.click(
      screen.getByRole('combobox', {
        name: 'Active account or organisation',
      }),
    );
    await userEvent.click(
      await screen.findByRole('option', { name: 'Northshire University' }),
    );

    expect(onContextChange).toHaveBeenCalledWith('university');
  });

  it('offers sign out in its expanded form', async () => {
    const onSignOut = vi.fn();

    render(
      <UserWidget
        contexts={contexts}
        currentContextId="personal"
        displayName="Alex Morgan"
        onContextChange={() => undefined}
        onSignOut={onSignOut}
        profileHref="#profile"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('links the user identity to their profile', () => {
    render(
      <UserWidget
        contexts={contexts}
        currentContextId="personal"
        displayName="Alex Morgan"
        onContextChange={() => undefined}
        onSignOut={() => undefined}
        profileHref="/profile"
      />,
    );

    expect(
      screen.getByRole('link', { name: /Alex Morgan/ }).getAttribute('href'),
    ).toBe('/profile');
  });
});
