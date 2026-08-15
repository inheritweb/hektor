import { getHealthCheck } from '@hektor/services/system';
import { getHealthCheckContract } from '@hektor/types/contracts/system';

import { registerEndpoint } from '../../../lib/api/route-handler';

export const GET = registerEndpoint(getHealthCheckContract, () => {
  return {
    data: getHealthCheck(),
  };
});
