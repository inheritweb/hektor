import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminOrganisationCohortDetailPage } from './AdminOrganisationCohortDetailPage.component';

const cohort = {
  id: 'cohort-id',
  name: 'September 2026',
  startsOn: '2026-09-01',
  endsOn: '2029-08-31',
  status: 'active',
  groups: [{ id: 'group-id', name: 'Clinical Practice A', status: 'active' }],
  learners: [
    {
      id: 'membership-id',
      platformStatus: 'active',
      role: 'learner',
      seatStatus: 'allocated',
      status: 'active',
      user: {
        id: 'user-id',
        displayName: 'Maya Patel',
        email: 'maya@example.com',
      },
    },
  ],
};

describe('AdminOrganisationCohortDetailPage', () => {
  it('renders cohort groups and canonical learners', () => {
    render(
      <AdminOrganisationCohortDetailPage
        cohort={cohort}
        getUserHref={(learner) => `/admin/users/${learner.user.id}`}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'September 2026' }),
    ).toBeTruthy();
    expect(screen.getByText('Clinical Practice A')).toBeTruthy();
    expect(screen.getByText('Maya Patel')).toBeTruthy();
    expect(screen.getByText('maya@example.com')).toBeTruthy();
    expect(screen.getByText('Platform status')).toBeTruthy();
    expect(screen.getByText('Organisation seat')).toBeTruthy();
    expect(screen.getByText('allocated')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'View' }).getAttribute('href'),
    ).toBe('/admin/users/user-id');
  });
});
