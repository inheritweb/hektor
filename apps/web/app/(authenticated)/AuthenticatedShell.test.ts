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
    expect(
      breadcrumbsForPath(
        '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a/cohorts/03d946de-8938-46d8-93a4-e3917df0928e',
        'Northbridge University',
        'September 2026',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Admin' },
      { label: 'Organisations', href: '/admin/organisations' },
      {
        label: 'Northbridge University',
        href: '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a',
      },
      {
        label: 'Cohorts',
        href: '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a/cohorts',
      },
      { label: 'September 2026' },
    ]);
    expect(
      breadcrumbsForPath(
        '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a/cohorts',
        'Northbridge University',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Admin' },
      { label: 'Organisations', href: '/admin/organisations' },
      {
        label: 'Northbridge University',
        href: '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a',
      },
      { label: 'Cohorts' },
    ]);
    expect(
      breadcrumbsForPath(
        '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a/contract-periods',
        'Northbridge University',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Admin' },
      { label: 'Organisations', href: '/admin/organisations' },
      {
        label: 'Northbridge University',
        href: '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a',
      },
      { label: 'Contract periods' },
    ]);
    expect(
      breadcrumbsForPath(
        '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a',
        'Northbridge University',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Admin' },
      { label: 'Organisations', href: '/admin/organisations' },
      { label: 'Northbridge University' },
    ]);
    expect(
      breadcrumbsForPath(
        '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a/users',
        'Northbridge University',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Admin' },
      { label: 'Organisations', href: '/admin/organisations' },
      {
        label: 'Northbridge University',
        href: '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a',
      },
      { label: 'Users' },
    ]);
  });
});
