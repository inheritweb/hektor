import {
  createAdminPatientScenarioDraftContract,
  getAdminPatientScenarioContract,
  listAdminPatientScenariosContract,
  listAdminPatientScenarioCatalogueContract,
  getAdminPatientScenarioResolvedRecordContract,
  updateAdminPatientScenarioDraftContract,
} from '@hektor/types/contracts/patient-scenarios';

import { registerApiMethod } from './api-method';

export const listAdminPatientScenarios = registerApiMethod(
  listAdminPatientScenariosContract,
);

export const listAdminPatientScenarioCatalogue = registerApiMethod(
  listAdminPatientScenarioCatalogueContract,
);

export const createAdminPatientScenarioDraft = registerApiMethod(
  createAdminPatientScenarioDraftContract,
);

export const getAdminPatientScenario = registerApiMethod(
  getAdminPatientScenarioContract,
);

export const updateAdminPatientScenarioDraft = registerApiMethod(
  updateAdminPatientScenarioDraftContract,
);

export const getAdminPatientScenarioResolvedRecord = registerApiMethod(
  getAdminPatientScenarioResolvedRecordContract,
);
