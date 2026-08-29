import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OrganisationDashboardPage } from './OrganisationDashboardPage.component';

describe('OrganisationDashboardPage', () => {
  it('places provisions within user administration', () => {
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
      screen
        .getByRole('link', { name: 'Manage provisions' })
        .getAttribute('href'),
    ).toBe('/users/provisions');
    expect(screen.getByText('Connected users')).toBeTruthy();
  });
});
