import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GlobalToolbar } from './GlobalToolbar.component';

describe('GlobalToolbar', () => {
  it('does not render an empty toolbar', () => {
    const { container } = render(<GlobalToolbar breadcrumbs={[]} />);

    expect(container.innerHTML).toBe('');
  });

  it('renders linked ancestors and identifies the current page', () => {
    render(
      <GlobalToolbar
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Users' },
        ]}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Home' }).getAttribute('href'),
    ).toBe('/');
    expect(screen.getByText('Users').getAttribute('aria-current')).toBe('page');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
