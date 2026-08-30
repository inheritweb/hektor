'use client';

import { useState, useSyncExternalStore } from 'react';

import {
  useGetOrganisationScimConfiguration,
  useGetOrganisationScimGroupMappings,
  useGetOrganisationCohorts,
  useGetOrganisationGroups,
  useIssueOrganisationScimToken,
  useRevokeOrganisationScimToken,
  useUpdateOrganisationScimConfiguration,
  useUpdateOrganisationScimGroupMapping,
} from '@hektor/query/organisations';
import { OrganisationRole } from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';
import { OrganisationScimConfigurationPage } from '@hektor/ui/pages';

export function OrganisationScimConfigurationScreen() {
  const configuration = useGetOrganisationScimConfiguration();
  const mappings = useGetOrganisationScimGroupMappings();
  const cohorts = useGetOrganisationCohorts({
    query: {
      dir: SortDirection.Ascending,
      order: 'name',
      page: 1,
      pageSize: 100,
    },
  });
  const groups = useGetOrganisationGroups({
    query: {
      dir: SortDirection.Ascending,
      order: 'name',
      page: 1,
      pageSize: 100,
    },
  });
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
  const updateMapping = useUpdateOrganisationScimGroupMapping();

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
      cohorts={(cohorts.data?.data ?? []).filter(
        ({ status }) => status === 'active',
      )}
      defaultRole={defaultRole}
      endpoint={`${origin}${configuration.data?.data.endpointPath ?? '/api/scim/v2'}`}
      error={
        configuration.error?.message ??
        update.error?.message ??
        issue.error?.message ??
        revoke.error?.message ??
        mappings.error?.message ??
        updateMapping.error?.message
      }
      groups={(groups.data?.data ?? []).filter(
        ({ status }) => status === 'active',
      )}
      issuedToken={issuedToken}
      loading={configuration.isPending || mappings.isPending}
      mappings={mappings.data?.data ?? []}
      onDefaultRoleChange={setDefaultRoleOverride}
      onIssueToken={() => issue.mutate({ body: {} })}
      onMappingChange={(mappingId, body) =>
        updateMapping.mutate({ body, params: { mappingId } })
      }
      onRevokeToken={() => revoke.mutate({ body: {} })}
      onSave={() => update.mutate({ body: { defaultRole } })}
      pending={
        update.isPending ||
        issue.isPending ||
        revoke.isPending ||
        updateMapping.isPending
      }
    />
  );
}
