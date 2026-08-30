import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OrganisationRole } from '@hektor/types';

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
    expect(
      screen.getByText(/either a Hektor cohort or a Hektor group/),
    ).toBeTruthy();
  });
});
