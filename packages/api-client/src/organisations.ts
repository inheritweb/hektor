import {
  autoLinkOrganisationUserProvisionContract,
  acceptOrganisationUserProvisionContract,
  createOrganisationContract,
  createOrganisationContractPeriodContract,
  getOrganisationContract,
  getOrganisationContractPeriodContract,
  getOrganisationCohortContract,
  getOrganisationGroupContract,
  getOrganisationUserProvisionContract,
  getProvisionAcceptanceContract,
  listOrganisationContractPeriodsContract,
  listOrganisationCohortsContract,
  listOrganisationGroupsContract,
  listOrganisationUserProvisionsContract,
  listOrganisationUsersContract,
  listOrganisationsContract,
  sendOrganisationProvisionInvitationContract,
  transitionOrganisationUserProvisionContract,
  updateOrganisationContract,
  updateOrganisationContractPeriodContract,
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

export const getOrganisationGroup = registerApiMethod(
  getOrganisationGroupContract,
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
