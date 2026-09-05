import { describe, expect, it } from 'vitest';

import { breadcrumbsForPath } from './AuthenticatedShell';

describe('breadcrumbsForPath', () => {
  it('describes the current authenticated views', () => {
    expect(breadcrumbsForPath('/')).toEqual([]);
    expect(breadcrumbsForPath('/profile')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Profile' },
    ]);
    expect(breadcrumbsForPath('/admin/patient-profiles/profile-id')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Learning' },
      { label: 'Patient profiles', href: '/admin/patient-profiles' },
      { label: 'Patient profile' },
    ]);
    expect(
      breadcrumbsForPath('/admin/patient-profiles/profile-id/edit'),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Learning' },
      { label: 'Patient profiles', href: '/admin/patient-profiles' },
      {
        label: 'Patient profile',
        href: '/admin/patient-profiles/profile-id',
      },
      { label: 'Edit' },
    ]);
    expect(
      breadcrumbsForPath(
        '/admin/patient-profiles/profile-id/version/version-id',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Learning' },
      { label: 'Patient profiles', href: '/admin/patient-profiles' },
      {
        label: 'Patient profile',
        href: '/admin/patient-profiles/profile-id',
      },
      { label: 'Version' },
    ]);
    expect(
      breadcrumbsForPath(
        '/admin/patient-profiles/profile-id/version/version-id/scenarios/new',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Learning' },
      { label: 'Patient profiles', href: '/admin/patient-profiles' },
      {
        label: 'Patient profile',
        href: '/admin/patient-profiles/profile-id',
      },
      {
        label: 'Version',
        href: '/admin/patient-profiles/profile-id/version/version-id',
      },
      { label: 'Add scenario' },
    ]);
    expect(
      breadcrumbsForPath(
        '/admin/patient-scenarios/scenario-id/edit',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'Acute ischaemic stroke (Esther)',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Scenarios', href: '/admin/patient-scenarios' },
      { label: 'Acute ischaemic stroke (Esther)' },
      { label: 'Edit' },
    ]);
    expect(breadcrumbsForPath('/admin/patient-scenarios')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Learning' },
      { label: 'Scenarios' },
    ]);
    expect(breadcrumbsForPath('/users/provisions')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Users', href: '/users' },
      { label: 'Provisioning' },
    ]);
    expect(
      breadcrumbsForPath('/admin/users/ab720a62-06df-408d-9e8c-0201ac69269a'),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Identity' },
      { label: 'Users', href: '/admin/users' },
      { label: 'User details' },
    ]);
    expect(
      breadcrumbsForPath(
        '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a/groups',
        'Northbridge University',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Identity' },
      { label: 'Organisations', href: '/admin/organisations' },
      {
        label: 'Northbridge University',
        href: '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a',
      },
      { label: 'Groups' },
    ]);
    expect(
      breadcrumbsForPath(
        '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a/cohorts/03d946de-8938-46d8-93a4-e3917df0928e',
        'Northbridge University',
        'September 2026',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Identity' },
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
      { label: 'Identity' },
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
      { label: 'Identity' },
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
      { label: 'Identity' },
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
      { label: 'Identity' },
      { label: 'Organisations', href: '/admin/organisations' },
      {
        label: 'Northbridge University',
        href: '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a',
      },
      { label: 'Users' },
    ]);
    expect(
      breadcrumbsForPath(
        '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a/provisioned-users/03d946de-8938-46d8-93a4-e3917df0928e',
        'Northbridge University',
        undefined,
        undefined,
        'Maya P.',
      ),
    ).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Identity' },
      { label: 'Organisations', href: '/admin/organisations' },
      {
        label: 'Northbridge University',
        href: '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a',
      },
      {
        label: 'Provisioned users',
        href: '/admin/organisations/ab720a62-06df-408d-9e8c-0201ac69269a/provisioned-users',
      },
      { label: 'Maya P.' },
    ]);
  });
});
