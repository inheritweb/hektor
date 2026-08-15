import { getCurrentUser } from '@hektor/api-client/users';

import { makeQuery } from './make-query';

export const CURRENT_USER_QUERY_KEY = ['users', 'current'] as const;

export const useCurrentUser = makeQuery(getCurrentUser, CURRENT_USER_QUERY_KEY);
