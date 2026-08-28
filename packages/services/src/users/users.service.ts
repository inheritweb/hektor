import { HektorErrorCode } from '@hektor/types/contracts';
import type {
  GetCurrentUserResponse,
  GetUserParams,
  GetUserResponse,
  ListUsersQuery,
  ListUsersResponse,
  CreateUserBody,
  CreateUserResponse,
  UpdateUserBody,
  UpdateUserParams,
  UpdateUserResponse,
} from '@hektor/types/contracts/users';
import { PlatformRole, UserStatus } from '@hektor/types';
import type { User } from '@supabase/supabase-js';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';

import { mapCurrentUser, mapUserListItem } from './users.mappers';
import { createUsersQueries } from './users.queries';

export function createUsersService(client: DatabaseClient) {
  const { buildCurrentUserOrganisationsQuery, buildUserMembershipCountsQuery } =
    createUsersQueries(client);

  function isSuspended(user: User) {
    return (
      Boolean(user.banned_until) &&
      new Date(user.banned_until!).getTime() > Date.now()
    );
  }

  function isActivePlatformAdmin(user: User) {
    return user.app_metadata.role === PlatformRole.Admin && !isSuspended(user);
  }

  async function listAllAuthUsers() {
    const users: User[] = [];
    let page = 1;

    while (true) {
      const { data, error } = await client.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (error) {
        throw createServiceError(HektorErrorCode.InternalServerError, {
          message: 'Unable to list users',
          internalMessage: error.message,
          cause: error,
        });
      }

      users.push(...data.users);
      if (data.users.length < 1000) return users;
      page += 1;
    }
  }

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
    const allUsers = await listAllAuthUsers();
    const filteredUsers = allUsers
      .filter(
        (user) =>
          !query.status ||
          (isSuspended(user) ? UserStatus.Suspended : UserStatus.Active) ===
            query.status,
      )
      .sort((left, right) =>
        query.dir === 'desc'
          ? right.created_at.localeCompare(left.created_at)
          : left.created_at.localeCompare(right.created_at),
      );
    const start = (query.page - 1) * query.pageSize;
    const pageUsers = filteredUsers.slice(start, start + query.pageSize);

    const userIds = pageUsers.map((user) => user.id);
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
        totalRecords: filteredUsers.length,
        sort: { order: query.order, dir: query.dir },
      },
      data: pageUsers.map((user) =>
        mapUserListItem(user, membershipCounts.get(user.id) ?? 0),
      ),
    };
  }

  async function updateUser(
    params: UpdateUserParams,
    body: UpdateUserBody,
    actorId: string,
  ): Promise<UpdateUserResponse> {
    const { data, error } = await client.auth.admin.getUserById(params.userId);
    if (error) {
      throw createServiceError(
        error.status === 404
          ? HektorErrorCode.NotFound
          : HektorErrorCode.InternalServerError,
        {
          message:
            error.status === 404 ? 'User not found' : 'Unable to update user',
          internalMessage: error.message,
          cause: error,
        },
      );
    }
    const target = data.user;
    if ((target.updated_at ?? target.created_at) !== body.expectedUpdatedAt) {
      throw createServiceError(HektorErrorCode.Conflict, {
        message:
          'This user was changed by someone else. Refresh and try again.',
      });
    }
    const removesAdmin =
      target.app_metadata.role === PlatformRole.Admin &&
      body.platformRole !== PlatformRole.Admin;
    const suspends = body.status === UserStatus.Suspended;
    if (target.id === actorId && (removesAdmin || suspends)) {
      throw createServiceError(HektorErrorCode.Conflict, {
        message:
          'You cannot suspend yourself or remove your own platform admin access.',
      });
    }
    if (isActivePlatformAdmin(target) && (removesAdmin || suspends)) {
      const activeAdmins = (await listAllAuthUsers()).filter(
        isActivePlatformAdmin,
      );
      if (activeAdmins.length <= 1) {
        throw createServiceError(HektorErrorCode.Conflict, {
          message:
            'The last active platform admin cannot be suspended or demoted.',
        });
      }
    }
    const otherAppMetadata = { ...target.app_metadata };
    delete otherAppMetadata.role;
    const { data: updated, error: updateError } =
      await client.auth.admin.updateUserById(target.id, {
        app_metadata: body.platformRole
          ? { ...otherAppMetadata, role: body.platformRole }
          : otherAppMetadata,
        user_metadata: {
          ...target.user_metadata,
          first_name: body.firstName,
          last_name: body.lastName,
        },
        ban_duration: suspends ? '876000h' : 'none',
      });
    if (updateError) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to update user',
        internalMessage: updateError.message,
        cause: updateError,
      });
    }

    if (suspends) {
      const { error: revokeError } = await client.rpc('revoke_user_sessions', {
        target_user_id: target.id,
      });
      if (revokeError) {
        throw createServiceError(HektorErrorCode.InternalServerError, {
          message:
            'The user was suspended, but their sessions could not be revoked',
          internalMessage: revokeError.message,
          cause: revokeError,
        });
      }
    }

    return getCurrentUser(updated.user);
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

  return { createUser, getCurrentUser, getUser, listUsers, updateUser };
}
