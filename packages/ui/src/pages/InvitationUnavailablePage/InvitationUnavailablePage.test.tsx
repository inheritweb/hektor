import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InvitationUnavailablePage } from './InvitationUnavailablePage.component';

describe('InvitationUnavailablePage', () => {
  it('explains how to obtain a replacement invitation', () => {
    render(<InvitationUnavailablePage />);

    expect(
      screen.getByRole('heading', {
        name: 'This invitation is no longer available.',
      }),
    ).toBeTruthy();
    expect(screen.getByText(/send another one/i)).toBeTruthy();
  });
});
