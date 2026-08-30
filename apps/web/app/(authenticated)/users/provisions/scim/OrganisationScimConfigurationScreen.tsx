'use client';

import { useState, useSyncExternalStore } from 'react';

import {
  useGetOrganisationScimConfiguration,
  useIssueOrganisationScimToken,
  useRevokeOrganisationScimToken,
  useUpdateOrganisationScimConfiguration,
} from '@hektor/query/organisations';
import { OrganisationRole } from '@hektor/types';
import { OrganisationScimConfigurationPage } from '@hektor/ui/pages';

export function OrganisationScimConfigurationScreen() {
  const configuration = useGetOrganisationScimConfiguration();
  const [defaultRoleOverride, setDefaultRoleOverride] =
    useState<OrganisationRole>();
  const [issuedToken, setIssuedToken] = useState<string>();
  const update = useUpdateOrganisationScimConfiguration();
  const issue = useIssueOrganisationScimToken({
    onSuccess: ({ data }) => setIssuedToken(data.token),
  });
  const revoke = useRevokeOrganisationScimToken({
    onSuccess: () => setIssuedToken(undefined),
  });

  const origin = useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => '',
  );
  const defaultRole =
    defaultRoleOverride ??
    configuration.data?.data.defaultRole ??
    OrganisationRole.Learner;

  return (
    <OrganisationScimConfigurationPage
      configuration={configuration.data?.data}
      defaultRole={defaultRole}
      endpoint={`${origin}${configuration.data?.data.endpointPath ?? '/api/scim/v2'}`}
      error={
        configuration.error?.message ??
        update.error?.message ??
        issue.error?.message ??
        revoke.error?.message
      }
      issuedToken={issuedToken}
      loading={configuration.isPending}
      onDefaultRoleChange={setDefaultRoleOverride}
      onIssueToken={() => issue.mutate({ body: {} })}
      onRevokeToken={() => revoke.mutate({ body: {} })}
      onSave={() => update.mutate({ body: { defaultRole } })}
      pending={update.isPending || issue.isPending || revoke.isPending}
    />
  );
}
