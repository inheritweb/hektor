import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OrganisationDetailsRail } from './OrganisationDetailsRail.component';

describe('OrganisationDetailsRail', () => {
  it('presents persistent organisation context', () => {
    render(
      <OrganisationDetailsRail
        organisation={{
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-15T11:00:00.000Z',
        }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Northbridge University' }),
    ).toBeTruthy();
    expect(screen.getByText('northbridge-university')).toBeTruthy();
    expect(screen.getByText('active')).toBeTruthy();
  });
});
