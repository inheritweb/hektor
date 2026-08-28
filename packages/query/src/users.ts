import {
  createUser,
  getCurrentUser,
  getUser,
  listUsers,
  updateUser,
} from '@hektor/api-client/users';

import { makeQuery } from './make-query';
import { makeMutation } from './make-mutation';

export const CURRENT_USER_QUERY_KEY = ['users', 'current'] as const;

export const useGetCurrentUser = makeQuery(
  getCurrentUser,
  CURRENT_USER_QUERY_KEY,
);

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;

export const useAdminGetUsers = makeQuery(listUsers, ADMIN_USERS_QUERY_KEY);

export const useAdminCreateUser = makeMutation(
  createUser,
  ADMIN_USERS_QUERY_KEY,
);

export const useAdminGetUser = makeQuery(getUser, ADMIN_USERS_QUERY_KEY);

export const useAdminUpdateUser = makeMutation(
  updateUser,
  ADMIN_USERS_QUERY_KEY,
);
