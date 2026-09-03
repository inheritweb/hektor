import {
  getAdminPatientScenarioContract,
  listAdminPatientScenariosContract,
  getAdminPatientScenarioResolvedRecordContract,
} from '@hektor/types/contracts/patient-scenarios';

import { registerApiMethod } from './api-method';

export const listAdminPatientScenarios = registerApiMethod(
  listAdminPatientScenariosContract,
);

export const getAdminPatientScenario = registerApiMethod(
  getAdminPatientScenarioContract,
);

export const getAdminPatientScenarioResolvedRecord = registerApiMethod(
  getAdminPatientScenarioResolvedRecordContract,
);
