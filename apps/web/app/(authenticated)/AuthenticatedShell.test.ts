import { describe, expect, it } from 'vitest';

import { breadcrumbsForPath } from './AuthenticatedShell';

describe('breadcrumbsForPath', () => {
  it('describes the current authenticated views', () => {
    expect(breadcrumbsForPath('/')).toEqual([{ label: 'Home' }]);
    expect(breadcrumbsForPath('/profile')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Profile' },
    ]);
    expect(
      breadcrumbsForPath('/admin/users/ab720a62-06df-408d-9e8c-0201ac69269a'),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Admin' },
      { label: 'Users', href: '/admin/users' },
      { label: 'User details' },
    ]);
  });
});
