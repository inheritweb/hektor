import { HektorErrorCode } from '@hektor/types/contracts';
import type {
  GetCurrentUserResponse,
  GetUserParams,
  GetUserResponse,
  ListUsersQuery,
  ListUsersResponse,
  CreateUserBody,
  CreateUserResponse,
} from '@hektor/types/contracts/users';
import type { User } from '@supabase/supabase-js';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';

import { mapCurrentUser, mapUserListItem } from './users.mappers';
import { createUsersQueries } from './users.queries';

export function createUsersService(client: DatabaseClient) {
  const { buildCurrentUserOrganisationsQuery, buildUserMembershipCountsQuery } =
    createUsersQueries(client);

  async function getCurrentUser(user: User): Promise<GetCurrentUserResponse> {
    const { data, error } = await buildCurrentUserOrganisationsQuery(user.id);

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to load your account',
        internalMessage: error.message,
        cause: error,
      });
    }

    return { data: mapCurrentUser(user, data) };
  }

  async function createUser(body: CreateUserBody): Promise<CreateUserResponse> {
    const { data, error } = await client.auth.admin.createUser({
      email: body.email,
      email_confirm: true,
      app_metadata: body.platformRole ? { role: body.platformRole } : {},
      user_metadata: {
        first_name: body.firstName,
        last_name: body.lastName,
        full_name: `${body.firstName} ${body.lastName}`,
      },
    });
    if (error) {
      throw createServiceError(
        error.status === 422
          ? HektorErrorCode.Conflict
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.status === 422
              ? 'A user with this email already exists'
              : 'Unable to create user',
          internalMessage: error.message,
          cause: error,
        },
      );
    }
    return getCurrentUser(data.user);
  }

  async function listUsers(query: ListUsersQuery): Promise<ListUsersResponse> {
    const { data: authData, error: authError } =
      await client.auth.admin.listUsers({
        page: query.page,
        perPage: query.pageSize,
      });

    if (authError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list users',
        internalMessage: authError.message,
        cause: authError,
      });
    }

    const userIds = authData.users.map((user) => user.id);
    const { data: memberships, error: membershipsError } = userIds.length
      ? await buildUserMembershipCountsQuery(userIds)
      : { data: [], error: null };

    if (membershipsError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list users',
        internalMessage: membershipsError.message,
        cause: membershipsError,
      });
    }

    const membershipCounts = memberships.reduce<Map<string, number>>(
      (counts, membership) => {
        if (!membership.user_id) return counts;
        counts.set(
          membership.user_id,
          (counts.get(membership.user_id) ?? 0) + 1,
        );
        return counts;
      },
      new Map(),
    );

    return {
      context: {
        page: query.page,
        pageSize: query.pageSize,
        totalRecords: authData.total,
        sort: { order: query.order, dir: query.dir },
      },
      data: authData.users.map((user) =>
        mapUserListItem(user, membershipCounts.get(user.id) ?? 0),
      ),
    };
  }

  async function getUser(params: GetUserParams): Promise<GetUserResponse> {
    const { data: authData, error: authError } =
      await client.auth.admin.getUserById(params.userId);

    if (authError) {
      const notFound = authError.status === HektorErrorCode.NotFound;
      throw createServiceError(
        notFound
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message: notFound ? 'User not found' : 'Unable to get user',
          internalMessage: authError.message,
          cause: authError,
        },
      );
    }

    return getCurrentUser(authData.user);
  }

  return { createUser, getCurrentUser, getUser, listUsers };
}
