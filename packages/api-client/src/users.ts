import { getCurrentUserContract } from '@hektor/types/contracts/users';

import { registerApiMethod } from './api-method';

export const getCurrentUser = registerApiMethod(getCurrentUserContract);
