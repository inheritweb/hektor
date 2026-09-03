import {
  getAdminPatientScenario,
  listAdminPatientScenarios,
  getAdminPatientScenarioResolvedRecord,
} from '@hektor/api-client/patient-scenarios';

import { makeQuery } from './make-query';

export const ADMIN_PATIENT_SCENARIOS_QUERY_KEY = [
  'admin',
  'patient-scenarios',
] as const;

export const useAdminPatientScenarios = makeQuery(
  listAdminPatientScenarios,
  ADMIN_PATIENT_SCENARIOS_QUERY_KEY,
);

export const useAdminPatientScenario = makeQuery(getAdminPatientScenario, [
  ...ADMIN_PATIENT_SCENARIOS_QUERY_KEY,
  'detail',
]);

export const useAdminPatientScenarioResolvedRecord = makeQuery(
  getAdminPatientScenarioResolvedRecord,
  [...ADMIN_PATIENT_SCENARIOS_QUERY_KEY, 'resolved-record'],
);
