import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OrganisationDashboardPage } from './OrganisationDashboardPage.component';

describe('OrganisationDashboardPage', () => {
  it('groups access and organisation structure into two pod rows', () => {
    render(
      <OrganisationDashboardPage
        cohortCount={3}
        groupCount={7}
        organisationName="Northbridge University"
        provisionCount={5}
        userCount={18}
      />,
    );

    expect(screen.getByText('Northbridge University')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /Provisioning/ }).getAttribute('href'),
    ).toBe('/users/provisions');
    expect(
      screen.getByRole('link', { name: /Configure SCIM/ }).getAttribute('href'),
    ).toBe('/users/provisions/scim');
    expect(screen.getByRole('link', { name: /Users/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Groups/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Cohorts/ })).toBeTruthy();
  });
});
