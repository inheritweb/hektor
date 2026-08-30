import {
  getAdminPatientProfileContract,
  listAdminPatientProfilesContract,
} from '@hektor/types/contracts/patient-profiles';

import { registerApiMethod } from './api-method';

export const listAdminPatientProfiles = registerApiMethod(
  listAdminPatientProfilesContract,
);

export const getAdminPatientProfile = registerApiMethod(
  getAdminPatientProfileContract,
);
