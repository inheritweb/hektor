import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminOrganisationCohortsPage } from './AdminOrganisationCohortsPage.component';

describe('AdminOrganisationCohortsPage', () => {
  it('renders cohort dates and status', () => {
    render(
      <AdminOrganisationCohortsPage
        cohorts={[
          {
            id: 'cohort-id',
            name: 'September 2026',
            startsOn: '2026-09-01',
            endsOn: '2029-08-31',
            status: 'active',
          },
        ]}
        onPageChange={() => undefined}
        organisationName="Northbridge University"
        page={1}
        pageSize={20}
        totalRecords={1}
      />,
    );

    expect(screen.getByText('September 2026')).toBeTruthy();
    expect(screen.getByText('1 Sept 2026')).toBeTruthy();
    expect(screen.getByText('31 Aug 2029')).toBeTruthy();
    expect(screen.getByText('active')).toBeTruthy();
  });
});
