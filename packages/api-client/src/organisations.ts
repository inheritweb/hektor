import {
  autoLinkOrganisationUserProvisionContract,
  acceptOrganisationUserProvisionContract,
  createOrganisationContract,
  createOrganisationContractPeriodContract,
  createOrganisationCohortContract,
  createTenantOrganisationCohortContract,
  createTenantOrganisationGroupContract,
  createOrganisationGroupContract,
  createOrganisationMembershipsContract,
  createOrganisationUserContract,
  commitOrganisationProvisionImportContract,
  getOrganisationContract,
  getTenantOrganisationContextContract,
  getTenantOrganisationCohortContract,
  getTenantOrganisationGroupContract,
  getOrganisationContractPeriodContract,
  getOrganisationCohortContract,
  getOrganisationGroupContract,
  getOrganisationMembershipContract,
  getTenantOrganisationMembershipContract,
  getOrganisationUserProvisionContract,
  getProvisionAcceptanceContract,
  listOrganisationContractPeriodsContract,
  listOrganisationCohortsContract,
  listOrganisationGroupsContract,
  listOrganisationUserProvisionsContract,
  listOrganisationUsersContract,
  listTenantOrganisationUsersContract,
  listTenantOrganisationCohortsContract,
  listTenantOrganisationGroupsContract,
  listOrganisationMembershipCandidatesContract,
  listOrganisationsContract,
  previewOrganisationProvisionImportContract,
  sendOrganisationProvisionInvitationContract,
  sendOrganisationProvisionInvitationsContract,
  transitionOrganisationUserProvisionContract,
  updateOrganisationContract,
  updateOrganisationContractPeriodContract,
  updateOrganisationCohortContract,
  updateTenantOrganisationCohortContract,
  updateTenantOrganisationGroupContract,
  updateOrganisationGroupContract,
  updateOrganisationGroupMembershipContract,
  updateOrganisationMembershipContract,
  updateTenantOrganisationMembershipContract,
} from '@hektor/types/contracts/organisations';

import { registerApiMethod } from './api-method';

export const listOrganisations = registerApiMethod(listOrganisationsContract);

export const getOrganisation = registerApiMethod(getOrganisationContract);

export const getTenantOrganisationContext = registerApiMethod(
  getTenantOrganisationContextContract,
);

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

export const getOrganisationUsers = registerApiMethod(
  listTenantOrganisationUsersContract,
);

export const getTenantOrganisationMembership = registerApiMethod(
  getTenantOrganisationMembershipContract,
);

export const updateTenantOrganisationMembership = registerApiMethod(
  updateTenantOrganisationMembershipContract,
);

export const getTenantOrganisationCohorts = registerApiMethod(
  listTenantOrganisationCohortsContract,
);

export const getTenantOrganisationCohort = registerApiMethod(
  getTenantOrganisationCohortContract,
);

export const createTenantOrganisationCohort = registerApiMethod(
  createTenantOrganisationCohortContract,
);

export const updateTenantOrganisationCohort = registerApiMethod(
  updateTenantOrganisationCohortContract,
);

export const getTenantOrganisationGroups = registerApiMethod(
  listTenantOrganisationGroupsContract,
);

export const getTenantOrganisationGroup = registerApiMethod(
  getTenantOrganisationGroupContract,
);

export const createTenantOrganisationGroup = registerApiMethod(
  createTenantOrganisationGroupContract,
);

export const updateTenantOrganisationGroup = registerApiMethod(
  updateTenantOrganisationGroupContract,
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

export const sendOrganisationProvisionInvitations = registerApiMethod(
  sendOrganisationProvisionInvitationsContract,
);

export const getProvisionAcceptance = registerApiMethod(
  getProvisionAcceptanceContract,
);

export const acceptOrganisationUserProvision = registerApiMethod(
  acceptOrganisationUserProvisionContract,
);
