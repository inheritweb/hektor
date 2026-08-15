import { getHealthCheckContract } from '@hektor/types/contracts/system';

import { registerApiMethod } from './api-method';

export const getHealthCheck = registerApiMethod(getHealthCheckContract);
