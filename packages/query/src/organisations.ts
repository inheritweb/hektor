import {
  autoLinkOrganisationUserProvision,
  acceptOrganisationUserProvision,
  createOrganisation,
  createOrganisationContractPeriod,
  createOrganisationCohort,
  createOrganisationGroup,
  createOrganisationMemberships,
  createOrganisationUser,
  getOrganisation,
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
  listOrganisationUsers,
  listOrganisationMembershipCandidates,
  listOrganisations,
  sendOrganisationProvisionInvitation,
  transitionOrganisationUserProvision,
  updateOrganisation,
  updateOrganisationContractPeriod,
  updateOrganisationCohort,
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

export const useGetProvisionAcceptance = makeQuery(getProvisionAcceptance, [
  'provisioning',
  'acceptance',
]);

export const useAcceptOrganisationUserProvision = makeMutation(
  acceptOrganisationUserProvision,
  ['provisioning', 'acceptance'],
);
