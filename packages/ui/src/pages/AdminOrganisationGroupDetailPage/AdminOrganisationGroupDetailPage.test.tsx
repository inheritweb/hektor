import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AdminOrganisationGroupDetailPage } from './AdminOrganisationGroupDetailPage.component';

const group = {
  name: 'Clinical Practice A',
  status: 'active',
  provisioningMethod: 'scim',
  sourceExternalId: 'entra-123',
  cohort: { name: 'September 2026' },
  users: [
    {
      id: 'member',
      role: 'learner',
      status: 'active',
      user: {
        id: 'user',
        displayName: 'Maya Patel',
        email: 'maya@example.com',
      },
    },
  ],
  provisionedUsers: [
    {
      id: 'provision',
      provisioningMethod: 'scim',
      provisionedDisplayName: 'Sam Rivera',
      provisionedUserName: 'sam@example.com',
      provisionedRole: 'learner',
      status: 'pending',
    },
  ],
};

describe('AdminOrganisationGroupDetailPage', () => {
  it('separates canonical and provisioned members', () => {
    render(
      <AdminOrganisationGroupDetailPage
        group={group}
        getUserHref={(item) => `/admin/users/${item.user.id}`}
      />,
    );
    expect(screen.getByText('Maya Patel')).toBeTruthy();
    expect(screen.getByText('Sam Rivera')).toBeTruthy();
    expect(
      screen.getByText('Managed by SCIM · September 2026 · entra-123'),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Membership is controlled by the external provisioning source.',
      ),
    ).toBeTruthy();
  });

  it('opens canonical membership management for a local active group', () => {
    const onManageUsers = vi.fn();
    render(
      <AdminOrganisationGroupDetailPage
        group={{ ...group, provisioningMethod: undefined }}
        onManageUsers={onManageUsers}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Manage users' }));
    expect(onManageUsers).toHaveBeenCalledOnce();
  });
});
