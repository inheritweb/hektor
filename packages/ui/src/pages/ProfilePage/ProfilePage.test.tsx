import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ProfilePage } from './ProfilePage.component';

const profile = {
  createdAt: '2025-09-12T10:00:00.000Z',
  displayName: 'Alex Morgan',
  email: 'alex@example.com',
  identities: [],
  memberships: [],
};

afterEach(cleanup);

describe('ProfilePage', () => {
  it('identifies a personal account that is also a platform admin', () => {
    render(<ProfilePage {...profile} platformRole="admin" />);

    expect(screen.getByText('Platform admin')).toBeTruthy();
    expect(screen.getByText('Personal account')).toBeTruthy();
  });

  it('does not show the admin label for a standard account', () => {
    render(<ProfilePage {...profile} />);

    expect(screen.queryByText('Platform admin')).toBeNull();
  });
});
