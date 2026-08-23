import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NavigationProvider } from '../../context';

import { AdminOrganisationUserProvisionDetailPage } from './AdminOrganisationUserProvisionDetailPage.component';

const provision = {
  cohort: { id: 'cohort', name: 'September 2026' },
  createdAt: '2026-08-15T10:00:00.000Z',
  groups: [{ id: 'group', name: 'Clinical Practice A' }],
  invitationSendCount: 0,
  lastSynchronizedAt: '2026-08-16T10:00:00.000Z',
  linkedAt: '2026-08-16T11:00:00.000Z',
  linkedUser: {
    id: 'user',
    displayName: 'Maya Patel',
    email: 'maya@example.com',
  },
  organisationUserId: 'membership',
  provisionedDisplayName: 'Maya P.',
  provisionedFamilyName: 'Patel',
  provisionedGivenName: 'Maya',
  provisionedRole: 'learner',
  provisionedUserName: 'maya@northbridge.example',
  provisioningMethod: 'scim',
  sourceExternalId: 'entra-user-123',
  status: 'linked',
  updatedAt: '2026-08-16T11:00:00.000Z',
};

describe('AdminOrganisationUserProvisionDetailPage', () => {
  it('shows asserted identity, assignments and the canonical user separately', () => {
    render(
      <NavigationProvider
        linkComponent={({ children, ...props }) => <a {...props}>{children}</a>}
      >
        <AdminOrganisationUserProvisionDetailPage
          getGroupHref={(group) => `/groups/${group.id}`}
          getUserHref={(user) => `/users/${user.id}`}
          provision={provision}
        />
      </NavigationProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Maya P.' })).toBeTruthy();
    expect(screen.getByText('entra-user-123')).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Clinical Practice A' })
        .getAttribute('href'),
    ).toBe('/groups/group');
    expect(
      screen
        .getByRole('link', { name: 'View canonical user' })
        .getAttribute('href'),
    ).toBe('/users/user');
    expect(screen.getByText('Maya Patel')).toBeTruthy();
  });

  it('explains when the provision is unresolved', () => {
    render(
      <AdminOrganisationUserProvisionDetailPage
        provision={{
          ...provision,
          linkedAt: undefined,
          linkedUser: undefined,
          organisationUserId: undefined,
          status: 'pending',
        }}
      />,
    );

    expect(
      screen.getByText('This provision has not been linked to a Hektor user.'),
    ).toBeTruthy();
  });

  it('runs a supplied lifecycle action', async () => {
    const onSelect = vi.fn();
    render(
      <AdminOrganisationUserProvisionDetailPage
        actions={[{ label: 'Deactivate', onSelect }]}
        provision={provision}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
