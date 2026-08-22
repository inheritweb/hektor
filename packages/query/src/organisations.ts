import {
  autoLinkOrganisationUserProvision,
  acceptOrganisationUserProvision,
  getOrganisation,
  getOrganisationCohort,
  getOrganisationGroup,
  getOrganisationUserProvision,
  getProvisionAcceptance,
  listOrganisationContractPeriods,
  listOrganisationCohorts,
  listOrganisationGroups,
  listOrganisationUserProvisions,
  listOrganisationUsers,
  listOrganisations,
  transitionOrganisationUserProvision,
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

export const useAdminGetOrganisationUserProvision = makeQuery(
  getOrganisationUserProvision,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationContractPeriods = makeQuery(
  listOrganisationContractPeriods,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationCohorts = makeQuery(
  listOrganisationCohorts,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationGroups = makeQuery(
  listOrganisationGroups,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);

export const useAdminGetOrganisationUsers = makeQuery(
  listOrganisationUsers,
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

export const useGetProvisionAcceptance = makeQuery(getProvisionAcceptance, [
  'provisioning',
  'acceptance',
]);

export const useAcceptOrganisationUserProvision = makeMutation(
  acceptOrganisationUserProvision,
  ['provisioning', 'acceptance'],
);
