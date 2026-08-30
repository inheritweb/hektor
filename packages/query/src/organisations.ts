import {
  autoLinkOrganisationUserProvision,
  acceptOrganisationUserProvision,
  createOrganisation,
  createOrganisationContractPeriod,
  createOrganisationCohort,
  createTenantOrganisationCohort,
  createTenantOrganisationGroup,
  createTenantOrganisationUserProvision,
  createOrganisationGroup,
  createOrganisationMemberships,
  createOrganisationUser,
  commitOrganisationProvisionImport,
  commitTenantOrganisationProvisionImport,
  getOrganisation,
  getTenantOrganisationContext,
  getTenantOrganisationScimConfiguration,
  getTenantOrganisationScimGroupMappings,
  getOrganisationContractPeriod,
  getOrganisationCohort,
  getOrganisationGroup,
  getOrganisationMembership,
  getOrganisationUserProvision,
  getProvisionAcceptance,
  listOrganisationContractPeriods,
  listOrganisationCohorts,
  listOrganisationGroups,
  listOrganisationUserProvisions,
  previewOrganisationProvisionImport,
  previewTenantOrganisationProvisionImport,
  listOrganisationUsers,
  getOrganisationUsers,
  getTenantOrganisationMembership,
  updateTenantOrganisationMembership,
  updateTenantOrganisationScimConfiguration,
  updateTenantOrganisationScimGroupMapping,
  getTenantOrganisationCohorts,
  getTenantOrganisationCohort,
  getTenantOrganisationGroup,
  getTenantOrganisationGroups,
  getTenantOrganisationUserProvisions,
  getTenantOrganisationUserProvision,
  listOrganisationMembershipCandidates,
  listOrganisations,
  issueTenantOrganisationScimToken,
  revokeTenantOrganisationScimToken,
  sendOrganisationProvisionInvitation,
  sendOrganisationProvisionInvitations,
  sendTenantOrganisationProvisionInvitation,
  sendTenantOrganisationProvisionInvitations,
  transitionOrganisationUserProvision,
  transitionTenantOrganisationUserProvision,
  updateOrganisation,
  updateOrganisationContractPeriod,
  updateOrganisationCohort,
  updateTenantOrganisationCohort,
  updateTenantOrganisationGroup,
  updateTenantOrganisationGroupMembership,
  updateOrganisationGroup,
  updateOrganisationGroupMembership,
  updateOrganisationMembership,
} from '@hektor/api-client/organisations';

import { makeQuery } from './make-query';
import { makeMutation } from './make-mutation';

export const ADMIN_ORGANISATIONS_QUERY_KEY = [
  'admin',
  'organisations',
] as const;

export const TENANT_ORGANISATION_QUERY_KEY = [
  'tenant',
  'organisation',
] as const;

export const useGetTenantOrganisationContext = makeQuery(
  getTenantOrganisationContext,
  TENANT_ORGANISATION_QUERY_KEY,
);

export const useGetOrganisationScimConfiguration = makeQuery(
  getTenantOrganisationScimConfiguration,
  [...TENANT_ORGANISATION_QUERY_KEY, 'scim'],
);

export const useGetOrganisationScimGroupMappings = makeQuery(
  getTenantOrganisationScimGroupMappings,
  [...TENANT_ORGANISATION_QUERY_KEY, 'scim', 'groups'],
);

export const useUpdateOrganisationScimGroupMapping = makeMutation(
  updateTenantOrganisationScimGroupMapping,
  [...TENANT_ORGANISATION_QUERY_KEY, 'scim', 'groups'],
);

export const useUpdateOrganisationScimConfiguration = makeMutation(
  updateTenantOrganisationScimConfiguration,
  [...TENANT_ORGANISATION_QUERY_KEY, 'scim'],
);

export const useIssueOrganisationScimToken = makeMutation(
  issueTenantOrganisationScimToken,
  [...TENANT_ORGANISATION_QUERY_KEY, 'scim'],
);

export const useRevokeOrganisationScimToken = makeMutation(
  revokeTenantOrganisationScimToken,
  [...TENANT_ORGANISATION_QUERY_KEY, 'scim'],
);

export const useGetOrganisationUsers = makeQuery(getOrganisationUsers, [
  ...TENANT_ORGANISATION_QUERY_KEY,
  'users',
]);

export const useGetOrganisationMembership = makeQuery(
  getTenantOrganisationMembership,
  [...TENANT_ORGANISATION_QUERY_KEY, 'users'],
);

export const useUpdateOrganisationMembership = makeMutation(
  updateTenantOrganisationMembership,
  [...TENANT_ORGANISATION_QUERY_KEY, 'users'],
);

export const useGetOrganisationCohorts = makeQuery(
  getTenantOrganisationCohorts,
  [...TENANT_ORGANISATION_QUERY_KEY, 'cohorts'],
);

export const useGetOrganisationCohort = makeQuery(getTenantOrganisationCohort, [
  ...TENANT_ORGANISATION_QUERY_KEY,
  'cohorts',
]);

export const useCreateOrganisationCohort = makeMutation(
  createTenantOrganisationCohort,
  [...TENANT_ORGANISATION_QUERY_KEY, 'cohorts'],
);

export const useUpdateOrganisationCohort = makeMutation(
  updateTenantOrganisationCohort,
  [...TENANT_ORGANISATION_QUERY_KEY, 'cohorts'],
);

export const useGetOrganisationGroups = makeQuery(getTenantOrganisationGroups, [
  ...TENANT_ORGANISATION_QUERY_KEY,
  'groups',
]);

export const useGetOrganisationGroup = makeQuery(getTenantOrganisationGroup, [
  ...TENANT_ORGANISATION_QUERY_KEY,
  'groups',
]);

export const useCreateOrganisationGroup = makeMutation(
  createTenantOrganisationGroup,
  [...TENANT_ORGANISATION_QUERY_KEY, 'groups'],
);

export const useUpdateOrganisationGroup = makeMutation(
  updateTenantOrganisationGroup,
  [...TENANT_ORGANISATION_QUERY_KEY, 'groups'],
);

export const useUpdateOrganisationGroupMembership = makeMutation(
  updateTenantOrganisationGroupMembership,
  [...TENANT_ORGANISATION_QUERY_KEY, 'groups'],
);

export const useGetOrganisationUserProvisions = makeQuery(
  getTenantOrganisationUserProvisions,
  [...TENANT_ORGANISATION_QUERY_KEY, 'user-provisions'],
);

export const usePreviewOrganisationProvisionImport = makeMutation(
  previewTenantOrganisationProvisionImport,
  [...TENANT_ORGANISATION_QUERY_KEY, 'user-provisions'],
);

export const useCommitOrganisationProvisionImport = makeMutation(
  commitTenantOrganisationProvisionImport,
  [...TENANT_ORGANISATION_QUERY_KEY, 'user-provisions'],
);

export const useCreateOrganisationUserProvision = makeMutation(
  createTenantOrganisationUserProvision,
  [...TENANT_ORGANISATION_QUERY_KEY, 'user-provisions'],
);

export const useGetOrganisationUserProvision = makeQuery(
  getTenantOrganisationUserProvision,
  [...TENANT_ORGANISATION_QUERY_KEY, 'user-provisions'],
);

export const useTransitionOrganisationUserProvision = makeMutation(
  transitionTenantOrganisationUserProvision,
  [...TENANT_ORGANISATION_QUERY_KEY, 'user-provisions'],
);

export const useSendOrganisationProvisionInvitation = makeMutation(
  sendTenantOrganisationProvisionInvitation,
  [...TENANT_ORGANISATION_QUERY_KEY, 'user-provisions'],
);

export const useSendOrganisationProvisionInvitations = makeMutation(
  sendTenantOrganisationProvisionInvitations,
  [...TENANT_ORGANISATION_QUERY_KEY, 'user-provisions'],
);

export const useAdminGetOrganisations = makeQuery(
  listOrganisations,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminCreateOrganisation = makeMutation(
  createOrganisation,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminUpdateOrganisation = makeMutation(
  updateOrganisation,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisation = makeQuery(
  getOrganisation,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationCohort = makeQuery(
  getOrganisationCohort,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationGroup = makeQuery(
  getOrganisationGroup,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationMembership = makeQuery(
  getOrganisationMembership,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationUserProvision = makeQuery(
  getOrganisationUserProvision,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationContractPeriods = makeQuery(
  listOrganisationContractPeriods,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminCreateOrganisationContractPeriod = makeMutation(
  createOrganisationContractPeriod,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationContractPeriod = makeQuery(
  getOrganisationContractPeriod,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminUpdateOrganisationContractPeriod = makeMutation(
  updateOrganisationContractPeriod,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationCohorts = makeQuery(
  listOrganisationCohorts,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminCreateOrganisationCohort = makeMutation(
  createOrganisationCohort,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminUpdateOrganisationCohort = makeMutation(
  updateOrganisationCohort,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationGroups = makeQuery(
  listOrganisationGroups,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminCreateOrganisationGroup = makeMutation(
  createOrganisationGroup,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminUpdateOrganisationGroup = makeMutation(
  updateOrganisationGroup,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminUpdateOrganisationGroupMembership = makeMutation(
  updateOrganisationGroupMembership,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminUpdateOrganisationMembership = makeMutation(
  updateOrganisationMembership,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminCreateOrganisationMemberships = makeMutation(
  createOrganisationMemberships,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminCreateOrganisationUser = makeMutation(
  createOrganisationUser,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminPreviewOrganisationProvisionImport = makeMutation(
  previewOrganisationProvisionImport,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminCommitOrganisationProvisionImport = makeMutation(
  commitOrganisationProvisionImport,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationUsers = makeQuery(
  listOrganisationUsers,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationMembershipCandidates = makeQuery(
  listOrganisationMembershipCandidates,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationUserProvisions = makeQuery(
  listOrganisationUserProvisions,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminTransitionOrganisationUserProvision = makeMutation(
  transitionOrganisationUserProvision,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminAutoLinkOrganisationUserProvision = makeMutation(
  autoLinkOrganisationUserProvision,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminSendOrganisationProvisionInvitation = makeMutation(
  sendOrganisationProvisionInvitation,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminSendOrganisationProvisionInvitations = makeMutation(
  sendOrganisationProvisionInvitations,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useGetProvisionAcceptance = makeQuery(getProvisionAcceptance, [
  'provisioning',
  'acceptance',
]);

export const useAcceptOrganisationUserProvision = makeMutation(
  acceptOrganisationUserProvision,
  ['provisioning', 'acceptance'],
);
