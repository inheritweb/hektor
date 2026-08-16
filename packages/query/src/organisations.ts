import {
  getOrganisation,
  listOrganisationUsers,
  listOrganisations,
} from '@hektor/api-client/organisations';

import { makeQuery } from './make-query';

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

export const useAdminGetOrganisationUsers = makeQuery(
  listOrganisationUsers,
  ADMIN_ORGANISATIONS_QUERY_KEY,
);
