import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OrganisationRole, ScimGroupTargetType } from '@hektor/types';

import { OrganisationScimConfigurationPage } from './OrganisationScimConfigurationPage.component';

describe('OrganisationScimConfigurationPage', () => {
  it('shows a newly issued token once and explains group target mapping', () => {
    render(
      <OrganisationScimConfigurationPage
        configuration={{
          defaultRole: OrganisationRole.Learner,
          enabled: true,
          endpointPath: '/api/scim/v2',
          tokenSuffix: 'r7K2',
        }}
        defaultRole={OrganisationRole.Learner}
        endpoint="https://hektor.example/api/scim/v2"
        issuedToken="hektor_scim_secret"
        mappings={[
          {
            displayName: 'Year 1',
            externalId: 'year-1',
            id: '4b671cbb-e885-45e1-ae36-f7aca34dceaa',
            lastSynchronizedAt: '2026-08-30T10:00:00.000Z',
            memberCount: 12,
            target: {
              id: '201d0426-1cb1-49d7-aac5-d707319cfd42',
              name: 'September 2026',
              type: ScimGroupTargetType.Cohort,
            },
          },
        ]}
        onDefaultRoleChange={vi.fn()}
        onIssueToken={vi.fn()}
        onRevokeToken={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(
      screen.getByDisplayValue('https://hektor.example/api/scim/v2'),
    ).toBeTruthy();
    expect(screen.getByDisplayValue('hektor_scim_secret')).toBeTruthy();
    expect(screen.getByText('Year 1')).toBeTruthy();
    expect(screen.getByText('12 members')).toBeTruthy();
    expect(screen.getByText('Cohort: September 2026')).toBeTruthy();
  });
});
