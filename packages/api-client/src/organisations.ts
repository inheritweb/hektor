import {
  autoLinkOrganisationUserProvisionContract,
  acceptOrganisationUserProvisionContract,
  createOrganisationContract,
  createOrganisationContractPeriodContract,
  createOrganisationCohortContract,
  createOrganisationGroupContract,
  createOrganisationMembershipsContract,
  createOrganisationUserContract,
  commitOrganisationProvisionImportContract,
  getOrganisationContract,
  getOrganisationContractPeriodContract,
  getOrganisationCohortContract,
  getOrganisationGroupContract,
  getOrganisationMembershipContract,
  getOrganisationUserProvisionContract,
  getProvisionAcceptanceContract,
  listOrganisationContractPeriodsContract,
  listOrganisationCohortsContract,
  listOrganisationGroupsContract,
  listOrganisationUserProvisionsContract,
  listOrganisationUsersContract,
  listOrganisationMembershipCandidatesContract,
  listOrganisationsContract,
  previewOrganisationProvisionImportContract,
  sendOrganisationProvisionInvitationContract,
  transitionOrganisationUserProvisionContract,
  updateOrganisationContract,
  updateOrganisationContractPeriodContract,
  updateOrganisationCohortContract,
  updateOrganisationGroupContract,
  updateOrganisationGroupMembershipContract,
  updateOrganisationMembershipContract,
} from '@hektor/types/contracts/organisations';

import { registerApiMethod } from './api-method';

export const listOrganisations = registerApiMethod(listOrganisationsContract);

export const getOrganisation = registerApiMethod(getOrganisationContract);

export const createOrganisation = registerApiMethod(createOrganisationContract);

export const updateOrganisation = registerApiMethod(updateOrganisationContract);

export const createOrganisationContractPeriod = registerApiMethod(
  createOrganisationContractPeriodContract,
);

export const getOrganisationContractPeriod = registerApiMethod(
  getOrganisationContractPeriodContract,
);

export const updateOrganisationContractPeriod = registerApiMethod(
  updateOrganisationContractPeriodContract,
);

export const getOrganisationCohort = registerApiMethod(
  getOrganisationCohortContract,
);

export const createOrganisationCohort = registerApiMethod(
  createOrganisationCohortContract,
);

export const updateOrganisationCohort = registerApiMethod(
  updateOrganisationCohortContract,
);

export const createOrganisationGroup = registerApiMethod(
  createOrganisationGroupContract,
);

export const updateOrganisationGroup = registerApiMethod(
  updateOrganisationGroupContract,
);

export const updateOrganisationGroupMembership = registerApiMethod(
  updateOrganisationGroupMembershipContract,
);

export const updateOrganisationMembership = registerApiMethod(
  updateOrganisationMembershipContract,
);

export const createOrganisationMemberships = registerApiMethod(
  createOrganisationMembershipsContract,
);

export const createOrganisationUser = registerApiMethod(
  createOrganisationUserContract,
);

export const previewOrganisationProvisionImport = registerApiMethod(
  previewOrganisationProvisionImportContract,
);

export const commitOrganisationProvisionImport = registerApiMethod(
  commitOrganisationProvisionImportContract,
);

export const getOrganisationGroup = registerApiMethod(
  getOrganisationGroupContract,
);

export const getOrganisationMembership = registerApiMethod(
  getOrganisationMembershipContract,
);

export const getOrganisationUserProvision = registerApiMethod(
  getOrganisationUserProvisionContract,
);

export const listOrganisationContractPeriods = registerApiMethod(
  listOrganisationContractPeriodsContract,
);

export const listOrganisationCohorts = registerApiMethod(
  listOrganisationCohortsContract,
);

export const listOrganisationGroups = registerApiMethod(
  listOrganisationGroupsContract,
);

export const listOrganisationUsers = registerApiMethod(
  listOrganisationUsersContract,
);

export const listOrganisationMembershipCandidates = registerApiMethod(
  listOrganisationMembershipCandidatesContract,
);

export const listOrganisationUserProvisions = registerApiMethod(
  listOrganisationUserProvisionsContract,
);

export const transitionOrganisationUserProvision = registerApiMethod(
  transitionOrganisationUserProvisionContract,
);

export const autoLinkOrganisationUserProvision = registerApiMethod(
  autoLinkOrganisationUserProvisionContract,
);

export const sendOrganisationProvisionInvitation = registerApiMethod(
  sendOrganisationProvisionInvitationContract,
);

export const getProvisionAcceptance = registerApiMethod(
  getProvisionAcceptanceContract,
);

export const acceptOrganisationUserProvision = registerApiMethod(
  acceptOrganisationUserProvisionContract,
);
