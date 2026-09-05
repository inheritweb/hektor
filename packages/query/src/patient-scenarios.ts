import {
  createAdminPatientScenarioDraft,
  getAdminPatientScenario,
  listAdminPatientScenarios,
  listAdminPatientScenarioCatalogue,
  getAdminPatientScenarioResolvedRecord,
  updateAdminPatientScenarioDraft,
} from '@hektor/api-client/patient-scenarios';

import { makeQuery } from './make-query';
import { makeMutation } from './make-mutation';

export const ADMIN_PATIENT_SCENARIOS_QUERY_KEY = [
  'admin',
  'patient-scenarios',
] as const;

export const useAdminPatientScenarios = makeQuery(
  listAdminPatientScenarios,
  ADMIN_PATIENT_SCENARIOS_QUERY_KEY,
);

export const useAdminPatientScenarioCatalogue = makeQuery(
  listAdminPatientScenarioCatalogue,
  ADMIN_PATIENT_SCENARIOS_QUERY_KEY,
);

export const useCreateAdminPatientScenarioDraft = makeMutation(
  createAdminPatientScenarioDraft,
  ADMIN_PATIENT_SCENARIOS_QUERY_KEY,
);

export const useAdminPatientScenario = makeQuery(getAdminPatientScenario, [
  ...ADMIN_PATIENT_SCENARIOS_QUERY_KEY,
  'detail',
]);

export const useUpdateAdminPatientScenarioDraft = makeMutation(
  updateAdminPatientScenarioDraft,
  ADMIN_PATIENT_SCENARIOS_QUERY_KEY,
);

export const useAdminPatientScenarioResolvedRecord = makeQuery(
  getAdminPatientScenarioResolvedRecord,
  [...ADMIN_PATIENT_SCENARIOS_QUERY_KEY, 'resolved-record'],
);
