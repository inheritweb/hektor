import {
  getAdminPatientProfile,
  listAdminPatientProfiles,
} from '@hektor/api-client/patient-profiles';

import { makeQuery } from './make-query';

export const ADMIN_PATIENT_PROFILES_QUERY_KEY = [
  'admin',
  'patient-profiles',
] as const;

export const useAdminPatientProfiles = makeQuery(
  listAdminPatientProfiles,
  ADMIN_PATIENT_PROFILES_QUERY_KEY,
);

export const useAdminPatientProfile = makeQuery(getAdminPatientProfile, [
  ...ADMIN_PATIENT_PROFILES_QUERY_KEY,
  'detail',
]);
