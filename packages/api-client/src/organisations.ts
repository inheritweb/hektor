import {
  autoLinkOrganisationUserProvisionContract,
  getOrganisationContract,
  getOrganisationCohortContract,
  getOrganisationGroupContract,
  getOrganisationUserProvisionContract,
  listOrganisationContractPeriodsContract,
  listOrganisationCohortsContract,
  listOrganisationGroupsContract,
  listOrganisationUserProvisionsContract,
  listOrganisationUsersContract,
  listOrganisationsContract,
  transitionOrganisationUserProvisionContract,
} from '@hektor/types/contracts/organisations';

import { registerApiMethod } from './api-method';

export const listOrganisations = registerApiMethod(listOrganisationsContract);

export const getOrganisation = registerApiMethod(getOrganisationContract);

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
