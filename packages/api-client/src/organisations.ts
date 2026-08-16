import {
  getOrganisationContract,
  listOrganisationUsersContract,
  listOrganisationsContract,
} from '@hektor/types/contracts/organisations';

import { registerApiMethod } from './api-method';

export const listOrganisations = registerApiMethod(listOrganisationsContract);

export const getOrganisation = registerApiMethod(getOrganisationContract);

export const listOrganisationUsers = registerApiMethod(
  listOrganisationUsersContract,
);
