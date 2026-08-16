import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminOrganisationDetailPage } from './AdminOrganisationDetailPage.component';

describe('AdminOrganisationDetailPage', () => {
  it('presents organisation details, collections, and user counts', () => {
    render(
      <AdminOrganisationDetailPage
        organisation={{
          id: 'organisation-id',
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-15T11:00:00.000Z',
          usersSummary: {
            total: 42,
            linked: 38,
            awaitingAccountLinking: 4,
            learners: 34,
            tutors: 6,
            organisationAdmins: 2,
            suspended: 1,
          },
          contractPeriods: [
            {
              id: 'contract-id',
              startsOn: '2026-09-01',
              endsOn: '2027-08-31',
              seats: { allowed: 250, activated: 34, remaining: 216 },
            },
          ],
          cohorts: [
            {
              id: 'cohort-id',
              name: 'September 2026',
              startsOn: '2026-09-01',
              endsOn: '2029-08-31',
              status: 'active',
            },
          ],
          groups: [
            {
              id: 'group-id',
              name: 'Clinical Practice A',
              status: 'active',
            },
          ],
        }}
        usersHref="/admin/organisations/organisation-id/users"
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Northbridge University' }),
    ).toBeTruthy();
    expect(screen.getByText('northbridge-university')).toBeTruthy();
    expect(screen.getByText('Awaiting account linking')).toBeTruthy();
    expect(screen.getByText('Clinical Practice A')).toBeTruthy();
    expect(screen.getByText('September 2026')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'View users' }).getAttribute('href'),
    ).toBe('/admin/organisations/organisation-id/users');
  });
});
