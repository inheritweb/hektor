import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminOrganisationContractPeriodsPage } from './AdminOrganisationContractPeriodsPage.component';

describe('AdminOrganisationContractPeriodsPage', () => {
  it('renders contract dates and derived seat usage', () => {
    render(
      <AdminOrganisationContractPeriodsPage
        contractPeriods={[
          {
            id: 'contract-id',
            startsOn: '2026-09-01',
            endsOn: '2027-08-31',
            seats: { allowed: 250, activated: 34, remaining: 216 },
          },
        ]}
        onPageChange={() => undefined}
        organisationName="Northbridge University"
        page={1}
        pageSize={20}
        totalRecords={1}
      />,
    );

    expect(screen.getByText('1 Sept 2026')).toBeTruthy();
    expect(screen.getByText('31 Aug 2027')).toBeTruthy();
    expect(screen.getByText('34 of 250 activated')).toBeTruthy();
    expect(screen.getByText('216')).toBeTruthy();
  });
});
