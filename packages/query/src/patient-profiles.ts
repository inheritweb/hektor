import {
  getAdminPatientProfile,
  listAdminPatientProfiles,
  updateAdminPatientProfileDraft,
} from '@hektor/api-client/patient-profiles';

import { makeQuery } from './make-query';
import { makeMutation } from './make-mutation';

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

export const useUpdateAdminPatientProfileDraft = makeMutation(
  updateAdminPatientProfileDraft,
  ADMIN_PATIENT_PROFILES_QUERY_KEY,
);
