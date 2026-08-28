import {
  getCurrentUserContract,
  getUserContract,
  listUsersContract,
  createUserContract,
  updateUserContract,
} from '@hektor/types/contracts/users';

import { registerApiMethod } from './api-method';

export const getCurrentUser = registerApiMethod(getCurrentUserContract);

export const listUsers = registerApiMethod(listUsersContract);

export const createUser = registerApiMethod(createUserContract);

export const getUser = registerApiMethod(getUserContract);

export const updateUser = registerApiMethod(updateUserContract);
