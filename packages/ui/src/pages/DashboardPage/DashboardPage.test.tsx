import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DashboardPage } from './DashboardPage.component';

describe('DashboardPage', () => {
  it('renders linked statistic pods including zero values', () => {
    render(
      <DashboardPage
        eyebrow="Organisation workspace"
        pods={[
          {
            description: 'Manage connected users.',
            href: '/users',
            label: 'Users',
            value: 0,
          },
        ]}
        title="Northbridge University"
      />,
    );

    expect(screen.getByText('Northbridge University')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /Users/ }).getAttribute('href'),
    ).toBe('/users');
  });
});
