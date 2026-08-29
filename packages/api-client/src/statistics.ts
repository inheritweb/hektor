import {
  getOrganisationStatisticsContract,
  getPlatformStatisticsContract,
} from '@hektor/types/contracts/statistics';

import { registerApiMethod } from './api-method';

export const getPlatformStatistics = registerApiMethod(
  getPlatformStatisticsContract,
);

export const getOrganisationStatistics = registerApiMethod(
  getOrganisationStatisticsContract,
);
