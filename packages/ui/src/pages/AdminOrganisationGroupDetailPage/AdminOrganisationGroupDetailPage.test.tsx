import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
  });
});
