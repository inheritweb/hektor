import { getCurrentUser, getUser, listUsers } from '@hektor/api-client/users';

import { makeQuery } from './make-query';

export const CURRENT_USER_QUERY_KEY = ['users', 'current'] as const;

export const useGetCurrentUser = makeQuery(
  getCurrentUser,
  CURRENT_USER_QUERY_KEY,
);

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;

export const useAdminGetUsers = makeQuery(listUsers, ADMIN_USERS_QUERY_KEY);

export const useAdminGetUser = makeQuery(getUser, ADMIN_USERS_QUERY_KEY);
