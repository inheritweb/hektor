import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminOrganisationDetailPage } from './AdminOrganisationDetailPage.component';

describe('AdminOrganisationDetailPage', () => {
  it('presents organisation details, collections, and user counts', () => {
    render(
      <AdminOrganisationDetailPage
        cohortsHref="/admin/organisations/organisation-id/cohorts"
        contractPeriodsHref="/admin/organisations/organisation-id/contract-periods"
        groupsHref="/admin/organisations/organisation-id/groups"
        organisation={{
          id: 'organisation-id',
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-15T11:00:00.000Z',
          usersSummary: {
            total: 42,
            learners: 34,
            tutors: 6,
            organisationAdmins: 2,
            suspended: 1,
          },
          userProvisionsSummary: {
            total: 4,
            pending: 4,
            inactive: 0,
            failed: 0,
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
        provisionsHref="/admin/organisations/organisation-id/provisioned-users"
        usersHref="/admin/organisations/organisation-id/users"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Users' })).toBeTruthy();
    expect(screen.getByText('Awaiting account linking')).toBeTruthy();
    expect(screen.getByText('Clinical Practice A')).toBeTruthy();
    expect(screen.getByText('September 2026')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'View groups' }).getAttribute('href'),
    ).toBe('/admin/organisations/organisation-id/groups');
    expect(
      screen.getByRole('link', { name: 'View cohorts' }).getAttribute('href'),
    ).toBe('/admin/organisations/organisation-id/cohorts');
    expect(
      screen
        .getByRole('link', { name: 'View contract periods' })
        .getAttribute('href'),
    ).toBe('/admin/organisations/organisation-id/contract-periods');
    expect(
      screen.getByRole('link', { name: 'View users' }).getAttribute('href'),
    ).toBe('/admin/organisations/organisation-id/users');
    expect(
      screen
        .getByRole('link', { name: 'View provisioned users' })
        .getAttribute('href'),
    ).toBe('/admin/organisations/organisation-id/provisioned-users');
  });
});
