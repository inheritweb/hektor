import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  NavigationLink,
  NavigationProvider,
  type NavigationLinkProps,
} from './NavigationContext';

describe('NavigationLink', () => {
  it('falls back to a native anchor', () => {
    render(<NavigationLink href="/users">Users</NavigationLink>);

    expect(
      screen.getByRole('link', { name: 'Users' }).getAttribute('href'),
    ).toBe('/users');
  });

  it('uses the injected navigation component', () => {
    const navigate = vi.fn();
    function TestLink({ href, onClick, ...props }: NavigationLinkProps) {
      return (
        <a
          {...props}
          href={href}
          onClick={(event) => {
            event.preventDefault();
            onClick?.(event);
            navigate(href);
          }}
        />
      );
    }

    render(
      <NavigationProvider linkComponent={TestLink}>
        <NavigationLink href="/organisations">Organisations</NavigationLink>
      </NavigationProvider>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Organisations' }));

    expect(navigate).toHaveBeenCalledWith('/organisations');
  });
});
