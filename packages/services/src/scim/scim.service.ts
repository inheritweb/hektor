import {
  SCIM_LIST_RESPONSE_SCHEMA,
  SCIM_USER_SCHEMA,
  type ScimListResponse,
  type ScimUser,
  type ScimUserInput,
} from '@hektor/types';
import { HektorErrorCode } from '@hektor/types/contracts';

import type { DatabaseClient } from '../database';
import { createServiceError } from '../errors';

import { createScimTokenHash } from './scim-configuration.service';

interface ScimContext {
  organisationId: string;
}

interface ListScimUsersOptions {
  count: number;
  startIndex: number;
  userName?: string;
}

function mapScimUser(
  record: {
    active: boolean;
    created_at: string;
    display_name: string | null;
    external_id: string | null;
    family_name: string | null;
    given_name: string | null;
    id: string;
    updated_at: string;
    user_name: string;
  },
  baseUrl: string,
): ScimUser {
  return {
    active: record.active,
    ...(record.display_name ? { displayName: record.display_name } : {}),
    ...(record.external_id ? { externalId: record.external_id } : {}),
    id: record.id,
    meta: {
      created: new Date(record.created_at).toISOString(),
      lastModified: new Date(record.updated_at).toISOString(),
      location: `${baseUrl}/Users/${record.id}`,
      resourceType: 'User',
    },
    ...(record.given_name || record.family_name
      ? {
          name: {
            ...(record.family_name ? { familyName: record.family_name } : {}),
            ...(record.given_name ? { givenName: record.given_name } : {}),
          },
        }
      : {}),
    schemas: [SCIM_USER_SCHEMA],
    userName: record.user_name,
  };
}

export function createScimService(client: DatabaseClient) {
  async function authenticate(token: string): Promise<ScimContext> {
    const { data, error } = await client
      .from('organisation_scim_configurations')
      .select('organisation_id, organisations!inner(status)')
      .eq('token_hash', createScimTokenHash(token))
      .is('token_revoked_at', null)
      .maybeSingle();

    if (error || !data || data.organisations.status !== 'active') {
      throw createServiceError(HektorErrorCode.Unauthorized, {
        message: 'The SCIM bearer token is invalid or inactive',
        internalMessage: error?.message,
        cause: error,
      });
    }

    return { organisationId: data.organisation_id };
  }

  async function listUsers(
    context: ScimContext,
    options: ListScimUsersOptions,
    baseUrl: string,
  ): Promise<ScimListResponse<ScimUser>> {
    let query = client
      .from('organisation_scim_users')
      .select(
        'active, created_at, display_name, external_id, family_name, given_name, id, updated_at, user_name',
        { count: 'exact' },
      )
      .eq('organisation_id', context.organisationId)
      .order('created_at')
      .range(
        Math.max(options.startIndex - 1, 0),
        Math.max(options.startIndex - 1, 0) + options.count - 1,
      );
    if (options.userName) query = query.eq('user_name', options.userName);
    const { data, error, count } = await query;

    if (error) {
      throw createServiceError(HektorErrorCode.InternalServerError, {
        message: 'Unable to list SCIM users',
        internalMessage: error.message,
        cause: error,
      });
    }

    return {
      Resources: data.map((record) => mapScimUser(record, baseUrl)),
      itemsPerPage: data.length,
      schemas: [SCIM_LIST_RESPONSE_SCHEMA],
      startIndex: options.startIndex,
      totalResults: count ?? 0,
    };
  }

  async function getUser(
    context: ScimContext,
    userId: string,
    baseUrl: string,
  ): Promise<ScimUser> {
    const { data, error } = await client
      .from('organisation_scim_users')
      .select(
        'active, created_at, display_name, external_id, family_name, given_name, id, updated_at, user_name',
      )
      .eq('organisation_id', context.organisationId)
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) {
      throw createServiceError(
        data ? HektorErrorCode.InternalServerError : HektorErrorCode.NotFound,
        {
          message: data ? 'Unable to get SCIM user' : 'SCIM user not found',
          internalMessage: error?.message,
          cause: error,
        },
      );
    }
    return mapScimUser(data, baseUrl);
  }

  async function synchronizeUser(
    context: ScimContext,
    input: ScimUserInput,
    baseUrl: string,
    userId?: string,
  ): Promise<ScimUser> {
    const { data, error } = await client.rpc('synchronize_scim_user', {
      target_active: input.active ?? true,
      target_display_name: input.displayName ?? '',
      target_external_id: input.externalId ?? '',
      target_family_name: input.name?.familyName ?? '',
      target_given_name: input.name?.givenName ?? '',
      target_organisation_id: context.organisationId,
      target_scim_user_id: userId ?? '00000000-0000-0000-0000-000000000000',
      target_user_name: input.userName.trim().toLocaleLowerCase(),
    });

    if (error) {
      const notFound = error.message.includes('scim_user_not_found');
      const conflict =
        error.code === '23505' || error.message.includes('scim_user_conflict');
      throw createServiceError(
        notFound
          ? HektorErrorCode.NotFound
          : conflict
            ? HektorErrorCode.Conflict
            : HektorErrorCode.UnprocessableEntity,
        {
          message: notFound
            ? 'SCIM user not found'
            : conflict
              ? 'A SCIM user with this userName or externalId already exists'
              : error.message.includes('learner_seat_capacity_exhausted')
                ? 'No learner seats are available'
                : 'Unable to synchronize SCIM user',
          internalMessage: error.message,
          cause: error,
        },
      );
    }

    return mapScimUser(data, baseUrl);
  }

  return { authenticate, getUser, listUsers, synchronizeUser };
}
