import {
  getCurrentUserContract,
  getUserContract,
  listUsersContract,
} from '@hektor/types/contracts/users';

import { registerApiMethod } from './api-method';

export const getCurrentUser = registerApiMethod(getCurrentUserContract);

export const listUsers = registerApiMethod(listUsersContract);

export const getUser = registerApiMethod(getUserContract);
