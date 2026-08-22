import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InstitutionalAccessUnavailablePage } from './InstitutionalAccessUnavailablePage.component';

describe('InstitutionalAccessUnavailablePage', () => {
  it('explains that the institution has not reserved a seat', () => {
    render(
      <InstitutionalAccessUnavailablePage institutionName="Northbridge University" />,
    );

    expect(screen.getByText(/hasn.*reserved a Hektor seat/)).toBeTruthy();
    expect(screen.getByText(/No Hektor account has been created/)).toBeTruthy();
  });
});
